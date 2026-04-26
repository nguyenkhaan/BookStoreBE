import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/income.dto';
import { BillStatus } from '@prisma/client';
@Injectable()
export class IncomeService {
	constructor(private prisma: PrismaService) {}
	async getGeneralStatistic() {
		try {
			const totalIncomeBills = await this.prisma.billIncome.aggregate({
				_count: { id: true },
			});
			const completeIncome = await this.prisma.billIncome.aggregate({
				_count: { id: true },
				where: {
					bill: {
						status: BillStatus.COMPLETE,
					},
				},
			});
			const notStartedIncome = await this.prisma.billIncome.aggregate({
				_count: { id: true },
				where: {
					bill: {
						status: BillStatus.NOT_STARTED,
					},
				},
			});
			const totalCost = await this.prisma.billIncome.aggregate({
				_sum: {
					cost: true,
				},
			});
			return {
				totalIncomeBills: totalIncomeBills._count.id,
				completeIncome: completeIncome._count.id,
				notStartedIncome: notStartedIncome._count.id,
				totalCost: Number(totalCost._sum.cost ?? 0),
			};
		} catch (err) {
			console.log('Get income statistic error: ', err);
			throw err;
		}
	}
	async getAllIncome() {
		const incomes = await this.prisma.billIncome.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				code: true,
				billId: true,
				id: true,
				cost: true,
				updatedAt: true,
				createdAt: true,
				paymentMethod: true,
				shortDescription: true,
				status: true,
				bill: {
					select: {
						customer: true,
						code : true 
					},
				},
				employee: true,
			},
		});
		const resultIncomes = incomes.map((income) => {
			return {
				code: income.code,
				id: income.id,
				cost: income.cost,
				status: income.status, 
				updatedAt: income.updatedAt,
				createdAt: income.createdAt,
				paymentMethod: income.paymentMethod,
				shortDescription: income.shortDescription,
				bill: {
					billId: income.billId,
					billCode : income.bill.code 
				},
				customer: {
					customerId: income.bill.customer.id,
					customerName: income.bill.customer.name,
				},
				employee: {
					employeeId: income.employee.id,
					employeeName: income.employee.name,
				},
			};
		});
		return resultIncomes;
	}

	async getIncomeById(id: number) {
		const income = await this.prisma.billIncome.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!income) {
			throw new NotFoundException('Income not found');
		}

		return income;
	}

	async getIncomeByCode(code: string) {
		const income = await this.prisma.billIncome.findFirst({
			where: {
				code,
				deletedAt: null,
			},
		});

		if (!income) {
			throw new NotFoundException('Income not found');
		}

		return income;
	}

	async createIncome(employeeId: number, dto: CreateIncomeDto) {
		return this.prisma.$transaction(async (tx) => {
			const bill = await tx.bill.findUnique({
				where: { code: dto.billCode },
			});

			if (!bill) {
				throw new NotFoundException('Bill not found');
			}

			const createdIncome = await tx.billIncome.create({
				data: {
					code: dto.code,
					cost: dto.cost,
					billId: bill.id,
					employeeId,
					shortDescription: dto.shortDescription,
					paymentMethod: dto.paymentMethod,
				},
			});

			await tx.bill.update({
				where: { id: bill.id },
				data: {
					cost: {
						increment: dto.cost,
					},
				},
			});
			const income = await tx.billIncome.findUnique({
				where: { id: createdIncome.id },
				select: {
					code: true,
					billId: true,
					id: true,
					cost: true,
					updatedAt: true,
					createdAt: true,
					paymentMethod: true,
					shortDescription: true,
					status: true,
					bill: {
						select: {
							customer: true,
							code: true 
						},
					},
					employee: true,
				},
			});
			if (!income) 
				throw new BadRequestException("income cannot be created") 
			return {
				code: income.code,
				id: income.id,
				status : income.status, 
				cost: income.cost,
				updatedAt: income.updatedAt,
				createdAt: income.createdAt,
				paymentMethod: income.paymentMethod,
				shortDescription: income.shortDescription,
				bill: {
					billId: income.billId,
					billCode : income.bill.code
				},
				customer: {
					customerId: income.bill.customer.id,
					customerName: income.bill.customer.name,
				},
				employee: {
					employeeId: income.employee.id,
					employeeName: income.employee.name,
				},
			};
		});
	}
	async updateIncome(id: number, dto: UpdateIncomeDto) {
		const income = await this.prisma.billIncome.findUnique({
			where: { id },
		});
		const dataForUpdate : any = { } 
		if (dto.code) 
			dataForUpdate.code = dto.code 
		if (dto.cost) 
			dataForUpdate.cost = dto.cost
		if (dto.paymentMethod)
			dataForUpdate.paymentMethod = dto.paymentMethod 
		if (dto.shortDescription) 
			dataForUpdate.shortDescription = dto.shortDescription
		if (dto.status) 
			dataForUpdate.status = dto.status

		if (dto.billCode)
		{
			const bill = await this.prisma.bill.findUnique({
				where : { code : dto.billCode }
			})
			if (!bill) 
				throw new BadRequestException("bill not found") 
			dataForUpdate.billId = bill.id 
		}
		if (!income) {
			throw new NotFoundException('Income not found');
		}
		console.log(dataForUpdate) 
		return this.prisma.billIncome.update({
			where: { id },
			data: dataForUpdate,
		});
	}

	async deleteIncome(id: number) {
		const income = await this.prisma.billIncome.findUnique({
			where: { id },
		});

		if (!income) {
			throw new NotFoundException('Income not found');
		}

		return this.prisma.billIncome.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});
	}
}
