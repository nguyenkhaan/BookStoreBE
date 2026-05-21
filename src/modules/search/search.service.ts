//Customer: (code, name, email, phone, )
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
	SearchBillDto,
	SearchBookDto,
	SearchCustomerDto,
	SearchEmployeeDto,
	SearchIncomeDto,
	SearchOutcomeDto,
	SearchRuleDto,
} from './type/search.type';
import {
	BILL_COST_MAX,
	COST_MAX,
	SALARY_MAX,
	STOCK_MAX,
} from '@/bases/commons/constants/app.constant';

@Injectable()
export class SearchService {
	constructor(private readonly prismaService: PrismaService) {}
	async findCustomer(payload: SearchCustomerDto) {
		try {
			const { name } = payload;
			const customers = await this.prismaService.customer.findMany({
				where: {
					...payload,
					...(name && {
						name: {
							contains: name,
							mode: 'insensitive',
						},
					}),
				},
				select: {
					id: true,
					code: true,
					name: true,
					email: true,
					phone: true,
					grade: true,
				},
			});
			return customers;
		} catch (err) {
			console.log('Find Customer Error: ', err);
			throw err;
		}
	}
	async findEmployee(
		payload: SearchEmployeeDto,
		salaryMin: number,
		salaryMax: number,
	) {
		try {
			const { name } = payload;
			const employees = await this.prismaService.employee.findMany({
				where: {
					...payload,
					salary: {
						lte: Math.min(SALARY_MAX, salaryMax),
						gte: Math.max(0, salaryMin),
					},
					...(name && {
						name: {
							contains: name,
							mode: 'insensitive',
						},
					}),
				},
				select: {
					id: true,
					code: true,
					name: true,
					email: true,
					phone: true,
					status: true,
					departmentId: true,
					positionId: true,
					salary: true,
					active: true,
				},
			});
			return employees;
		} catch (err) {
			console.log('Find Employee Error: ', err);
			throw err;
		}
	}
	async findBook(query: SearchBookDto) {
		try {
			const {
				title,
				year,
				authorName,
				stockMin,
				stockMax,
				costMin,
				costMax,
			} = query;

			const books = await this.prismaService.book.findMany({
				where: {
					deletedAt: null,

					...(title && {
						title: {
							contains: title,
							mode: 'insensitive',
						},
					}),

					...(year && { year }),

					...(costMin || costMax
						? {
								cost: {
									gte: costMin ?? 0,
									lte: costMax ?? COST_MAX,
								},
							}
						: {}),

					...(stockMin || stockMax
						? {
								inventory: {
									stock: {
										gte: stockMin ?? 0,
										lte: stockMax ?? STOCK_MAX,
									},
								},
							}
						: {}),

					...(authorName && {
						authors: {
							some: {
								author: {
									name: {
										contains: authorName,
										mode: 'insensitive',
									},
								},
							},
						},
					}),
				},

				select: {
					id: true,
					code: true,
					title: true,
					year: true,
					cost: true,
					coverImage: true,
					inventory: {
						select: {
							stock: true,
						},
					},
					authors: {
						select: {
							author: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});

			return books;
		} catch (err) {
			console.log('Find Book Error:', err);
			throw err;
		}
	}
	async findRule(query: SearchRuleDto) {
		try {
			const { title, content, status, type } = query;
			const rules = await this.prismaService.rule.findMany({
				where: {
					...(title && {
						title: {
							contains: title,
							mode: 'insensitive',
						},
					}),
					...(content && {
						content: {
							contains: content,
							mode: 'insensitive',
						},
					}),
					...(status && { status }),
					...(type && { type }),
				},
			});
			return rules;
		} catch (err) {
			console.log('Find Rule Error: ', err);
			throw err;
		}
	}
	async findBill(query: SearchBillDto) {
		try {
			const {
				code,
				customerId,
				status,
				costMin,
				costMax,
				createdFrom,
				createdTo,
			} = query;

			const bills = await this.prismaService.bill.findMany({
				where: {
					...(code && {
						code: { contains: code, mode: 'insensitive' },
					}),

					...(customerId && { customerId }),
					...(status && { status }),

					...(costMin || costMax
						? {
								cost: {
									gte: costMin ?? 0,
									lte: costMax ?? BILL_COST_MAX,
								},
							}
						: {}),

					...(createdFrom || createdTo
						? {
								createdAt: {
									gte: createdFrom ?? new Date(0),
									lte: createdTo ?? new Date(),
								},
							}
						: {}),
				},

				select: {
					id: true,
					code: true,
					customerId: true,
					status: true,
					cost: true,
					createdAt: true,
				},
			});

			return bills;
		} catch (err) {
			console.log('Find Bill Error:', err);
			throw err;
		}
	}
	async findIncome(query: SearchIncomeDto) {
		try {
			const {
				code,
				employeeId,
				billId,
				status,
				costMin,
				costMax,
				shortDescription,
				createdFrom,
				createdTo,
			} = query;

			const incomes = await this.prismaService.billIncome.findMany({
				where: {
					deletedAt: null,

					...(code && {
						code: { contains: code, mode: 'insensitive' },
					}),

					...(employeeId && { employeeId }),
					...(billId && { billId }),
					...(status && { status }),

					...(shortDescription && {
						shortDescription: {
							contains: shortDescription,
							mode: 'insensitive',
						},
					}),

					...(costMin || costMax
						? {
								cost: {
									gte: costMin ?? 0,
									lte: costMax ?? Number.MAX_SAFE_INTEGER,
								},
							}
						: {}),

					...(createdFrom || createdTo
						? {
								createdAt: {
									gte: createdFrom ?? new Date(0),
									lte: createdTo ?? new Date(),
								},
							}
						: {}),
				},

				select: {
					id: true,
					code: true,
					employeeId: true,
					billId: true,
					cost: true,
					status: true,
					shortDescription: true,
					createdAt: true,
				},
			});

			return incomes;
		} catch (err) {
			console.log('Find Income Error:', err);
			throw err;
		}
	}
	async findOutcome(query: SearchOutcomeDto) {
		try {
			const {
				code,
				publisherId,
				employeeId,
				bookId,
				status,
				costMin,
				costMax,
				quantityMin,
				quantityMax,
				createdFrom,
				createdTo,
			} = query;

			const outcomes = await this.prismaService.billOutcome.findMany({
				where: {
					deletedAt: null,

					...(code && {
						code: { contains: code, mode: 'insensitive' },
					}),

					...(publisherId && { publisherId }),
					...(employeeId && { employeeId }),
					...(bookId && { bookId }),
					...(status && { status }),

					...(costMin || costMax
						? {
								cost: {
									gte: costMin ?? 0,
									lte: costMax ?? Number.MAX_SAFE_INTEGER,
								},
							}
						: {}),

					...(quantityMin || quantityMax
						? {
								quantity: {
									gte: quantityMin ?? 0,
									lte: quantityMax ?? Number.MAX_SAFE_INTEGER,
								},
							}
						: {}),

					...(createdFrom || createdTo
						? {
								createdAt: {
									gte: createdFrom ?? new Date(0),
									lte: createdTo ?? new Date(),
								},
							}
						: {}),
				},

				select: {
					id: true,
					code: true,
					publisherId: true,
					employeeId: true,
					cost: true,
					quantity: true,
					status: true,
					createdAt: true,
				},
			});

			return outcomes;
		} catch (err) {
			console.log('Find Outcome Error:', err);
			throw err;
		}
	}
}
