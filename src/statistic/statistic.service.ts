import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BillStatus } from '@prisma/client';

@Injectable()
export class StatisticService {
	constructor(private readonly prismaService: PrismaService) {}

	private async sumRevenueInDuration(startDate: Date, endDate: Date) {
		const ans = await this.prismaService.bill.aggregate({
			_sum: { cost: true },
			where: {
				//Trang thai: Khac DAHUY ==== Cap nhat lai o phan sua chua trang thai
				createdAt: {
					gte: startDate,
					lt: endDate,
				},
			},
		});
		return Number(ans._sum.cost) || 0;
	}
	private async countBillsInDuration(startDate: Date, endDate: Date) {
		const ans = await this.prismaService.bill.aggregate({
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
		return ans;
	}

	private calProportionRate(a: number, b: number) {
		if (b == 0) return 0;
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
		return totalBooks || 0;
	}
	//Public Method
	//Lay thong tin thong ke tong quan
	async getGeneralStatistic() {
		try {
			//Tong doanh thu tu truoc den nay
			const totalRevenue = await this.calTotalRevenue();
			//Tong so luong khach hang
			const totalCustomers = await this.calTotalCustomers();

			const totalBills = await this.calTotalBills();
			const totalBooks = await this.calTotalBooks();
			return {
				totalRevenue,
				totalCustomers,
				totalBills,
				totalBooks,
			};
		} catch (err) {
			console.log('General revenue error: ', err);
			throw err;
		}
	}

	//Lay thong tin thong ke cho doanh thu
	async getGeneralRevenue() {
		const now = new Date();
		const previousMonth = new Date(
			now.getFullYear(),
			now.getMonth() - 1,
			1,
		);
		const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		//Doanh thu
		const thisMonthRevenue = await this.sumRevenueInDuration(
			currentMonth,
			nextMonth,
		);
		const previousMonthRevenue = await this.sumRevenueInDuration(
			previousMonth,
			currentMonth,
		);
		//So luong don hang trong thang
		const thisMonthBills = await this.countBillsInDuration(
			currentMonth,
			nextMonth,
		);
		const previousMonthBills = await this.countBillsInDuration(
			previousMonth,
			currentMonth,
		);
		//counting

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
		try {
			const now = new Date();
			const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const startMonth = new Date(
				now.getFullYear(),
				now.getMonth() - month,
				1,
			);
			//
			const result = await this.prismaService.$queryRaw`
                     SELECT 
                    TO_CHAR("createdAt", 'YYYY-MM') as month,
                    SUM(cost) as revenue
                    FROM "Bill"
                    WHERE "createdAt" >= ${startMonth}
                      AND "createdAt" < ${endMonth}
                    GROUP BY month
                    ORDER BY month ASC
                    `;
			return result;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getCountBillInRecentMonths(month: number) {
		try {
			const now = new Date();
			const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const startMonth = new Date(
				now.getFullYear(),
				now.getMonth() - month,
				1,
			);
			const result = await this.prismaService.$queryRaw`
                SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(code) as revenue, 
                FROM "Bill" 
                WHERE "createdAt" >= ${startMonth}
                      AND "createdAt" < ${endMonth}
                GROUP BY month 
                ORDER BY month ASC 
            `;
			return result;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	//Top 5 sach co doanh thu cao nhat
	async getTopHighBooks() {
		try {
			const topBooks = await this.prismaService.billDetail.groupBy({
				by: ['bookId'],
				_sum: {
					quantity: true,
				},
				orderBy: {
					_sum: {
						quantity: 'desc',
					},
				},
				where: {
					book: { deletedAt: null },
				},
				take: 5,
			});

			//Get detail top book information
			const topBooksIds = topBooks.map((book) => book.bookId);
			const result = [];
			const selectedBooks = await this.prismaService.book.findMany({
				where: {
					id: { in: topBooksIds },
					deletedAt: null,
				},
				select: {
					id: true,
					code: true,
					title: true,
				},
			});
			const mp = new Map();
			selectedBooks.map((book) => {
				mp.set(book.id, book);
				return book.id;
			});
			for (const book of topBooks) {
				if (mp.has(book.bookId)) {
					result.push({
						...mp.get(book.bookId),
						sum: book._sum.quantity ?? 0,
					});
				}
			}
			return result;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getInventoryByCategory() {
		try {
			const books = await this.prismaService.book.findMany({
				where: {
					deletedAt: null,
					inventory: {
						stock: { gt: 0 },
					},
				},
				select: {
					category: true,
					cost: true,
					inventory: {
						select: {
							stock: true,
						},
					},
				},
			});

			const map = new Map<
				string,
				{ count: number; totalValue: number }
			>();

			for (const book of books) {
				const category = book.category;
				const stock = book.inventory?.stock || 0;
				const cost = Number(book.cost);

				if (!map.has(category)) {
					map.set(category, {
						count: 0,
						totalValue: 0,
					});
				}

				const current = map.get(category)!;

				current.count += 1;
				current.totalValue += cost * stock;
			}

			return Array.from(map.entries()).map(([category, value]) => ({
				category,
				count: value.count,
				totalValue: value.totalValue,
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getCustomerByGrade() {
		try {
			const customers = await this.prismaService.customer.groupBy({
				by: ['grade'],
				_count: { code: true },
				where: {
					deletedAt: null,
				},
			});
			return customers.map((customer) => ({
				grade: customer.grade,
				total: customer._count.code,
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
}
