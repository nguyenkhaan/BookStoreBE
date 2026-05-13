import { Injectable } from '@nestjs/common';
import { IncomeStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
	CustomerDebitMonthlyItemDto,
	RevenueChartItemDto,
	TopCustomerItemDto,
} from './dto/statistic.dto';

@Injectable()
export class StatisticRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async getRevenueChart(month: number): Promise<RevenueChartItemDto[]> {
		const rows = await this.prismaService.$queryRaw<
			{ month: string; revenue: number | string | null }[]
		>`
			WITH RECURSIVE params AS (
				SELECT
					DATE_TRUNC('month', CURRENT_DATE) - (${month}::int - 1) * INTERVAL '1 month' AS start_month,
					DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' AS end_month
			),
			months AS (
				SELECT TO_CHAR(m, 'YYYY-MM') AS month_key
				FROM params,
				GENERATE_SERIES(start_month, end_month - INTERVAL '1 month', INTERVAL '1 month') AS m
			),
			bill_base AS (
				SELECT
					b.id,
					b."createdAt",
					COALESCE(SUM((bd.quantity::numeric) * bk.cost), 0::numeric) AS subtotal
				FROM "Bill" b
				LEFT JOIN "BillDetail" bd ON bd."billId" = b.id
				LEFT JOIN "Book" bk ON bk.id = bd."bookId"
				CROSS JOIN params p
				WHERE b."createdAt" >= p.start_month
					AND b."createdAt" < p.end_month
				GROUP BY b.id, b."createdAt"
			),
			voucher_ranked AS (
				SELECT
					vu."billId" AS bill_id,
					v.type,
					v.sale,
					ROW_NUMBER() OVER (PARTITION BY vu."billId" ORDER BY vu.id ASC) AS rn
				FROM "VoucherUsage" vu
				JOIN "Voucher" v ON v.id = vu."voucherId"
			),
				recursive_discount AS (
					SELECT bb.id AS bill_id, 0::bigint AS rn, bb.subtotal AS amount
				FROM bill_base bb
				UNION ALL
				SELECT
					rd.bill_id,
					vr.rn,
					CASE
						WHEN vr.type::text = 'PERCENT' THEN GREATEST(0::numeric, rd.amount - (rd.amount * vr.sale / 100::numeric))
						ELSE GREATEST(0::numeric, rd.amount - vr.sale)
					END AS amount
				FROM recursive_discount rd
				JOIN voucher_ranked vr ON vr.bill_id = rd.bill_id AND vr.rn = rd.rn + 1
			),
			bill_final AS (
				SELECT
					bb.id,
					bb."createdAt",
					rd.amount AS final_bill
				FROM bill_base bb
				JOIN LATERAL (
					SELECT amount
					FROM recursive_discount rdx
					WHERE rdx.bill_id = bb.id
					ORDER BY rn DESC
					LIMIT 1
				) rd ON TRUE
			),
			monthly_revenue AS (
				SELECT
					TO_CHAR("createdAt", 'YYYY-MM') AS month_key,
					SUM(final_bill) AS revenue
				FROM bill_final
				GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
			)
			SELECT
				m.month_key AS month,
				COALESCE(mr.revenue, 0::numeric) AS revenue
			FROM months m
			LEFT JOIN monthly_revenue mr ON mr.month_key = m.month_key
			ORDER BY m.month_key ASC
		`;

		return rows.map((row) => ({
			month: row.month,
			revenue: Number(row.revenue ?? 0),
		}));
	}

	async getCustomerDebtProgression(): Promise<CustomerDebitMonthlyItemDto[]> {
		const rows = await this.prismaService.$queryRaw<
			{
				date: string;
				customerId: number;
				customerName: string;
				openingDebt: number | string;
				generatedDebt: number | string;
				closingDebt: number | string;
			}[]
		>`
					WITH RECURSIVE bill_base AS (
					SELECT
						b.id,
						b."customerId",
						b."createdAt",
						COALESCE(SUM((bd.quantity::numeric) * bk.cost), 0::numeric) AS subtotal
					FROM "Bill" b
					LEFT JOIN "BillDetail" bd ON bd."billId" = b.id
					LEFT JOIN "Book" bk ON bk.id = bd."bookId"
					GROUP BY b.id, b."customerId", b."createdAt"
				),
				voucher_ranked AS (
					SELECT
					vu."billId" AS bill_id,
					v.type,
					v.sale,
					ROW_NUMBER() OVER (PARTITION BY vu."billId" ORDER BY vu.id ASC) AS rn
				FROM "VoucherUsage" vu
				JOIN "Voucher" v ON v.id = vu."voucherId"
			),
				recursive_discount AS (
					SELECT bb.id AS bill_id, 0::bigint AS rn, bb.subtotal AS amount
				FROM bill_base bb
				UNION ALL
				SELECT
					rd.bill_id,
					vr.rn,
					CASE
						WHEN vr.type::text = 'PERCENT' THEN GREATEST(0::numeric, rd.amount - (rd.amount * vr.sale / 100::numeric))
						ELSE GREATEST(0::numeric, rd.amount - vr.sale)
					END AS amount
				FROM recursive_discount rd
				JOIN voucher_ranked vr ON vr.bill_id = rd.bill_id AND vr.rn = rd.rn + 1
			),
				bill_final AS (
					SELECT
						bb.id,
						bb."customerId",
						bb."createdAt",
						rd.amount AS final_bill
					FROM bill_base bb
					JOIN LATERAL (
					SELECT amount
					FROM recursive_discount rdx
					WHERE rdx.bill_id = bb.id
					ORDER BY rn DESC
					LIMIT 1
				) rd ON TRUE
			),
			bill_paid AS (
				SELECT
					bi."billId" AS bill_id,
					COALESCE(SUM(bi.cost), 0::numeric) AS paid
				FROM "BillIncome" bi
				WHERE bi."deletedAt" IS NULL
					AND bi.status = ${IncomeStatus.COMPLETE}
				GROUP BY bi."billId"
			),
				bill_debt AS (
					SELECT
						bf."customerId",
						bf."createdAt",
						GREATEST(0::numeric, bf.final_bill - COALESCE(bp.paid, 0::numeric)) AS debt
					FROM bill_final bf
					LEFT JOIN bill_paid bp ON bp.bill_id = bf.id
				),
				monthly_generated AS (
					SELECT
						bd."customerId",
						DATE_TRUNC('month', bd."createdAt") AS month_date,
						SUM(bd.debt) AS generated_debt
					FROM bill_debt bd
					WHERE bd.debt > 0::numeric
					GROUP BY bd."customerId", DATE_TRUNC('month', bd."createdAt")
				),
				customer_month_bound AS (
					SELECT
						mg."customerId",
						MIN(mg.month_date) AS start_month,
						DATE_TRUNC('month', CURRENT_DATE) AS end_month
					FROM monthly_generated mg
					GROUP BY mg."customerId"
				),
				customer_months AS (
					SELECT
						cmb."customerId",
						ms.month_date
					FROM customer_month_bound cmb
					CROSS JOIN LATERAL GENERATE_SERIES(
						cmb.start_month,
						cmb.end_month,
						INTERVAL '1 month'
					) AS ms(month_date)
				),
				monthly_debt AS (
					SELECT
						cm."customerId",
						cm.month_date,
						COALESCE(mg.generated_debt, 0::numeric) AS generated_debt
					FROM customer_months cm
					LEFT JOIN monthly_generated mg
						ON mg."customerId" = cm."customerId"
						AND mg.month_date = cm.month_date
				),
				monthly_closing AS (
					SELECT
						md."customerId",
						md.month_date,
						md.generated_debt,
						SUM(md.generated_debt) OVER (
							PARTITION BY md."customerId"
							ORDER BY md.month_date
							ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
						) AS closing_debt
					FROM monthly_debt md
				),
				monthly_progression AS (
					SELECT
						mc."customerId",
						mc.month_date,
						COALESCE(
							LAG(mc.closing_debt) OVER (
								PARTITION BY mc."customerId"
								ORDER BY mc.month_date
							),
							0::numeric
						) AS opening_debt,
						mc.generated_debt,
						mc.closing_debt
					FROM monthly_closing mc
				)
				SELECT
					TO_CHAR(mp.month_date, 'YYYY-MM') AS date,
					c.id AS "customerId",
					c.name AS "customerName",
					mp.opening_debt AS "openingDebt",
					mp.generated_debt AS "generatedDebt",
					mp.closing_debt AS "closingDebt"
				FROM monthly_progression mp
				JOIN "Customer" c ON c.id = mp."customerId"
				WHERE c."deletedAt" IS NULL
					AND mp.closing_debt > 0::numeric
				ORDER BY date ASC, c.id ASC
			`;

		return rows.map((row) => ({
			date: row.date,
			customer: {
				id: row.customerId,
				name: row.customerName,
			},
			openingDebt: Number(row.openingDebt),
			generatedDebt: Number(row.generatedDebt),
			closingDebt: Number(row.closingDebt),
		}));
	}

	async getTopCustomers(limit: number): Promise<TopCustomerItemDto[]> {
		const rows = await this.prismaService.$queryRaw<
			{
				customerId: number;
				customerCode: string;
				customerName: string;
				email: string;
				phone: string;
				grade: string;
				totalPaid: number | string;
			}[]
		>`
			SELECT
				c.id AS "customerId",
				c.code AS "customerCode",
				c.name AS "customerName",
				c.email,
				c.phone,
				c.grade::text AS grade,
				SUM(bi.cost) AS "totalPaid"
			FROM "BillIncome" bi
			JOIN "Bill" b ON b.id = bi."billId"
			JOIN "Customer" c ON c.id = b."customerId"
			WHERE bi."deletedAt" IS NULL
				AND bi.status = ${IncomeStatus.COMPLETE}
				AND c."deletedAt" IS NULL
			GROUP BY c.id, c.code, c.name, c.email, c.phone, c.grade
			ORDER BY "totalPaid" DESC
			LIMIT ${limit}
		`;

		return rows.map((row) => ({
			...row,
			totalPaid: Number(row.totalPaid),
		}));
	}
}
