import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/income.dto';
import { BillStatus } from '@prisma/client';
@Injectable()
export class IncomeService {
	constructor(private prisma: PrismaService) {}
	async getGeneralStatistic() 
	{
		try 
		{
			const totalIncomeBills = await this.prisma.billIncome.aggregate({
				_count : { id : true }, 
			}) 
			const completeIncome = await this.prisma.billIncome.aggregate({
				_count : { id : true }, 
				where: {
					bill : {
						status : BillStatus.COMPLETE
					}
				}
			})
			const notStartedIncome = await this.prisma.billIncome.aggregate({
				_count : { id : true }, 
				where: {
					bill : {
						status : BillStatus.NOT_STARTED
					}
				}
			})
			const totalCost = await this.prisma.billIncome.aggregate({
				_sum : {
					cost : true 
				} 
			}) 
			return {
				totalIncomeBills : totalIncomeBills._count.id, 
				completeIncome : completeIncome._count.id, 
				notStartedIncome : notStartedIncome._count.id, 
				totalCost : Number(totalCost._sum.cost ?? 0)
			}
		} 
		catch (err) 
		{
			console.log("Get income statistic error: " , err) 
			throw err 
		}
	}
	async getAllIncome() {
		return this.prisma.billIncome.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				bill: true,
				employee: true,
			},
		});
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
				where: { id: dto.billId },
			});

			if (!bill) {
				throw new NotFoundException('Bill not found');
			}

			const income = await tx.billIncome.create({
				data: {
					code: dto.code,
					cost: dto.cost,
					billId: dto.billId,
					employeeId,
					shortDescription: dto.shortDescription,
					paymentMethod : dto.payment
				},
			});

			await tx.bill.update({
				where: {
					id: dto.billId,
				},
				data: {
					cost: {
						increment: dto.cost,
					},
				},
			});

			return income;
		});
	}

	async updateIncome(id: number, dto: UpdateIncomeDto) {
		const income = await this.prisma.billIncome.findUnique({
			where: { id },
		});

		if (!income) {
			throw new NotFoundException('Income not found');
		}

		return this.prisma.billIncome.update({
			where: { id },
			data: dto,
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
