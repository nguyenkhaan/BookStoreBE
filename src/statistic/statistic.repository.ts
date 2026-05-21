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
			{
				month: string;
				totalRevenue: number;
				actualReceived: number;
				debtAdded: number;
			}[]
		>`
            WITH months AS (
                SELECT TO_CHAR(GENERATE_SERIES(
                    DATE_TRUNC('month', CURRENT_DATE) - (${month - 1} || ' months')::interval,
                    DATE_TRUNC('month', CURRENT_DATE),
                    '1 month'::interval
                ), 'YYYY-MM') AS month
            ),
            bill_stats AS (
                SELECT 
                    b.id,
                    TO_CHAR(b."createdAt", 'YYYY-MM') AS month,
                    b.cost AS total_revenue,
                    COALESCE(SUM(bi.cost), 0) AS actual_received
                FROM "Bill" b
                LEFT JOIN "BillIncome" bi ON bi."billId" = b.id AND bi.status = 'COMPLETE' AND bi."deletedAt" IS NULL
                WHERE b.status = 'COMPLETE'
                GROUP BY b.id, b.cost, b."createdAt"
            ),
            monthly_stats AS (
                SELECT 
                    month,
                    SUM(total_revenue) AS total_revenue,
                    SUM(actual_received) AS actual_received
                FROM bill_stats
                GROUP BY month
            )
            SELECT 
                m.month,
                COALESCE(s.total_revenue, 0) AS "totalRevenue",
                COALESCE(s.actual_received, 0) AS "actualReceived",
                GREATEST(0, COALESCE(s.total_revenue, 0) - COALESCE(s.actual_received, 0)) AS "debtAdded"
            FROM months m
            LEFT JOIN monthly_stats s ON m.month = s.month
            ORDER BY m.month ASC
        `;

		return rows.map((r) => ({
			month: r.month,
			totalRevenue: Number(r.totalRevenue),
			actualReceived: Number(r.actualReceived),
			debtAdded: Number(r.debtAdded),
		}));
	}

	async getCustomerDebtProgression(): Promise<CustomerDebitMonthlyItemDto[]> {
		const rows = await this.prismaService.$queryRaw<any[]>`
            WITH customer_transactions AS (
                SELECT 
                    b."customerId",
                    TO_CHAR(b."createdAt", 'YYYY-MM') AS month,
                    SUM(b.cost) AS bought_amount,
                    0 AS paid_amount
                FROM "Bill" b
                WHERE b.status = 'COMPLETE'
                GROUP BY b."customerId", TO_CHAR(b."createdAt", 'YYYY-MM')
                
                UNION ALL
                
                SELECT 
                    b."customerId",
                    TO_CHAR(bi."createdAt", 'YYYY-MM') AS month,
                    0 AS bought_amount,
                    SUM(bi.cost) AS paid_amount
                FROM "BillIncome" bi
                JOIN "Bill" b ON b.id = bi."billId"
                WHERE bi.status = 'COMPLETE' AND bi."deletedAt" IS NULL
                GROUP BY b."customerId", TO_CHAR(bi."createdAt", 'YYYY-MM')
            ),
            monthly_net AS (
                SELECT 
                    "customerId",
                    month,
                    SUM(bought_amount) - SUM(paid_amount) AS generated_debt
                FROM customer_transactions
                GROUP BY "customerId", month
            ),
            customer_first_month AS (
                SELECT "customerId", MIN(month) AS start_month
                FROM monthly_net
                GROUP BY "customerId"
            ),
            all_months AS (
                SELECT TO_CHAR(GENERATE_SERIES(
                    (SELECT CAST(MIN(start_month) || '-01' AS DATE) FROM customer_first_month),
                    DATE_TRUNC('month', CURRENT_DATE),
                    '1 month'::interval
                ), 'YYYY-MM') AS month
            ),
            dense_customer_months AS (
                SELECT c."customerId", m.month
                FROM customer_first_month c
                JOIN all_months m ON m.month >= c.start_month
            ),
            progression AS (
                SELECT 
                    d."customerId",
                    d.month AS date,
                    COALESCE(n.generated_debt, 0) AS "generatedDebt",
                    SUM(COALESCE(n.generated_debt, 0)) OVER (
                        PARTITION BY d."customerId" 
                        ORDER BY d.month ASC 
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ) AS "closingDebt"
                FROM dense_customer_months d
                LEFT JOIN monthly_net n ON d."customerId" = n."customerId" AND d.month = n.month
            )
            SELECT 
                p.date,
                c.id AS "customerId",
                c.name AS "customerName",
                p."closingDebt" - p."generatedDebt" AS "openingDebt",
                p."generatedDebt",
                p."closingDebt"
            FROM progression p
            JOIN "Customer" c ON c.id = p."customerId"
            WHERE c."deletedAt" IS NULL 
              AND (p."closingDebt" > 0 OR p."generatedDebt" != 0 OR (p."closingDebt" - p."generatedDebt") > 0)
            ORDER BY p.date ASC, c.id ASC
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
		const rows = await this.prismaService.$queryRaw<any[]>`
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
