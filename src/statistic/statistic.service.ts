import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BillStatus } from '@prisma/client';
import { RevenueChartQueryDto } from './dto/statistic.dto';
import { StatisticRepository } from './statistic.repository';

@Injectable()
export class StatisticService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly statisticRepository: StatisticRepository,
	) {}

	async getRecentOrders(limit: number) {
		const bills = await this.prismaService.bill.findMany({
			select: {
				id: true,
				code: true,
				cost: true,
				status: true,
				customer: {
					select: { name: true },
				},
				createdAt: true,
			},
			orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
			take: limit,
		});

		return bills.map((bill) => ({
			id: bill.id,
			code: bill.code,
			amount: bill.cost,
			status: bill.status,
			date: bill.createdAt,
		}));
	}

	private async sumRevenueInDuration(startDate: Date, endDate: Date) {
		const ans = await this.prismaService.bill.aggregate({
			_sum: { cost: true },
			where: {
				createdAt: {
					gte: startDate,
					lt: endDate,
				},
				status: BillStatus.COMPLETE,
			},
		});
		return Number(ans._sum.cost) || 0;
	}

	private async countBillsInDuration(startDate: Date, endDate: Date) {
		return await this.prismaService.bill.aggregate({
			_count: { code: true },
			_avg: { cost: true },
			where: {
				createdAt: {
					gte: startDate,
					lt: endDate,
				},
				status: BillStatus.COMPLETE,
			},
		});
	}

	private calProportionRate(a: number, b: number) {
		if (a == 0) return 0;
		return Number((((b - a) * 100) / a).toFixed(1));
	}

	private async calTotalCustomers() {
		const ans = await this.prismaService.customer.aggregate({
			_count: { code: true },
			where: { deletedAt: null },
		});
		return ans._count.code;
	}

	private async calTotalRevenue() {
		const totalRevenue = await this.prismaService.bill.aggregate({
			_sum: { cost: true },
			where: {
				status: BillStatus.COMPLETE,
			},
		});
		return totalRevenue._sum.cost || 0;
	}

	private async calTotalBills() {
		const totalBills = await this.prismaService.bill.aggregate({
			_count: { code: true },
		});
		return totalBills._count.code;
	}

	private async calTotalBooks() {
		const totalBooks = await this.prismaService.billDetail.aggregate({
			_sum: { quantity: true },
			where: {
				bill: {
					status: BillStatus.COMPLETE,
				},
			},
		});
		return totalBooks._sum.quantity || 0;
	}

	async getGeneralStatistic() {
		const totalRevenue = await this.calTotalRevenue();
		const totalCustomers = await this.calTotalCustomers();
		const totalBills = await this.calTotalBills();
		const totalBooks = await this.calTotalBooks();

		return {
			totalRevenue,
			totalCustomers,
			totalBills,
			totalBooks,
		};
	}

	async getGeneralRevenue() {
		const now = new Date();
		const previousMonth = new Date(
			now.getFullYear(),
			now.getMonth() - 1,
			1,
		);
		const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

		const thisMonthRevenue = await this.sumRevenueInDuration(
			currentMonth,
			nextMonth,
		);
		const previousMonthRevenue = await this.sumRevenueInDuration(
			previousMonth,
			currentMonth,
		);

		const thisMonthBills = await this.countBillsInDuration(
			currentMonth,
			nextMonth,
		);
		const previousMonthBills = await this.countBillsInDuration(
			previousMonth,
			currentMonth,
		);

		return {
			monthRevenue: thisMonthRevenue,
			revenueProportionRate: this.calProportionRate(
				previousMonthRevenue,
				thisMonthRevenue,
			),
			countBills: thisMonthBills._count.code,
			countBillsProportionRate: this.calProportionRate(
				previousMonthBills._count.code,
				thisMonthBills._count.code,
			),
			avgBills: thisMonthBills._avg.cost,
			avgBillsProportionRate: this.calProportionRate(
				Number(previousMonthBills._avg.cost) || 0,
				Number(thisMonthBills._avg.cost) || 0,
			),
		};
	}

	async getRevenueInRecentMonths(month: number) {
		const now = new Date();
		const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startMonth = new Date(
			now.getFullYear(),
			now.getMonth() - month,
			1,
		);

		return await this.prismaService.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month,
                SUM(cost) as revenue
            FROM "Bill"
            WHERE "createdAt" >= ${startMonth}
                AND "createdAt" < ${endMonth}
                AND status = ${BillStatus.COMPLETE}
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
            ORDER BY month ASC
        `;
	}

	async getCountBillInRecentMonths(month: number) {
		const now = new Date();
		const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startMonth = new Date(
			now.getFullYear(),
			now.getMonth() - month,
			1,
		);

		return await this.prismaService.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(code) as bill_count
            FROM "Bill" 
            WHERE "createdAt" >= ${startMonth}
                AND "createdAt" < ${endMonth}
                AND status = ${BillStatus.COMPLETE}
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM') 
            ORDER BY month ASC 
        `;
	}

	async getTopHighBooks() {
		const topBooks = await this.prismaService.billDetail.groupBy({
			by: ['bookId'],
			_sum: { quantity: true },
			orderBy: { _sum: { quantity: 'desc' } },
			where: {
				book: { deletedAt: null },
				bill: { status: BillStatus.COMPLETE },
			},
			take: 5,
		});

		const topBooksIds = topBooks.map((book) => book.bookId);
		const selectedBooks = await this.prismaService.book.findMany({
			where: { id: { in: topBooksIds }, deletedAt: null },
			select: { id: true, code: true, title: true },
		});

		return selectedBooks
			.map((book) => {
				const soldData = topBooks.find((t) => t.bookId === book.id);
				return {
					bookId: book.id,
					bookCode: book.code,
					title: book.title,
					totalSold: soldData?._sum.quantity ?? 0,
				};
			})
			.sort((a, b) => b.totalSold - a.totalSold);
	}

	async getInventoryByCategory() {
		const books = await this.prismaService.book.findMany({
			where: { deletedAt: null, inventory: { stock: { gt: 0 } } },
			select: {
				category: true,
				inventory: { select: { stock: true } },
			},
		});

		const map = new Map<string, number>();
		for (const book of books) {
			const category = book.category || 'Khác';
			const stock = book.inventory?.stock || 0;
			map.set(category, (map.get(category) || 0) + stock);
		}

		return Array.from(map.entries()).map(([category, stock], index) => ({
			categoryCode: `CAT-${index + 1}`,
			categoryName: category,
			value: stock,
		}));
	}

	async getInventoryFlow(months: number) {
		const rows = await this.prismaService.$queryRaw<any[]>`
            WITH months AS (
                SELECT TO_CHAR(GENERATE_SERIES(
                    DATE_TRUNC('month', CURRENT_DATE) - (${months - 1} || ' months')::interval,
                    DATE_TRUNC('month', CURRENT_DATE),
                    '1 month'::interval
                ), 'YYYY-MM') AS month
            ),
            exports AS (
                SELECT TO_CHAR(b."createdAt", 'YYYY-MM') AS month, SUM(bd.quantity) AS qty
                FROM "BillDetail" bd
                JOIN "Bill" b ON b.id = bd."billId"
                WHERE b.status = 'COMPLETE'
                GROUP BY month
            )
            SELECT m.month, COALESCE(e.qty, 0) AS "exportQuantity", 0 AS "importQuantity"
            FROM months m
            LEFT JOIN exports e ON m.month = e.month
            ORDER BY m.month ASC
        `;
		return rows.map((r) => ({
			month: r.month,
			exportQuantity: Number(r.exportQuantity),
			importQuantity: Number(r.importQuantity),
		}));
	}

	async getCustomerByGrade() {
		const customers = await this.prismaService.customer.groupBy({
			by: ['grade'],
			_count: { code: true },
			where: { deletedAt: null },
		});

		return customers.map((customer) => ({
			grade: customer.grade,
			total: customer._count.code,
		}));
	}

	async getRevenueChart(query: RevenueChartQueryDto) {
		return await this.statisticRepository.getRevenueChart(query.month ?? 6);
	}

	async getCustomerDebit() {
		return await this.statisticRepository.getCustomerDebtProgression();
	}

	async getTopCustomers(limit: number) {
		return await this.statisticRepository.getTopCustomers(limit);
	}
}
