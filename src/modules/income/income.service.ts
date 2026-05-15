import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/income.dto';
import { BillStatus } from '@prisma/client';
import { ENUM_VI_MAP, mapEnumToVietnamese } from '@/utlitis/enumLocalization';
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
						code: true,
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
				statusLabel: mapEnumToVietnamese(
					income.status,
					ENUM_VI_MAP.incomeStatus,
				),
				updatedAt: income.updatedAt,
				createdAt: income.createdAt,
				paymentMethod: income.paymentMethod,
				paymentMethodLabel: mapEnumToVietnamese(
					income.paymentMethod,
					ENUM_VI_MAP.incomePaymentType,
				),
				shortDescription: income.shortDescription,
				bill: {
					billId: income.billId,
					billCode: income.bill.code,
				},
				customer: {
					customerId: income.bill.customer.id,
					customerName: income.bill.customer.name ?? 'Khách vãng lai',
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
			throw new NotFoundException('Không tìm thấy phiếu thu');
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
			throw new NotFoundException('Không tìm thấy phiếu thu');
		}

		return income;
	}
	async createIncomeCode() {
		const latest = await this.prisma.billOutcome.findFirst({
			orderBy: {
				id: 'desc',
			},
			select: {
				code: true,
			},
		});
		if (!latest) return `INC001`;
		return (
			'INC' +
			(Number(latest.code.replace('INC', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
	}
	async createIncome(employeeId: number, dto: CreateIncomeDto) {
		let code = await this.createIncomeCode();
		return this.prisma.$transaction(async (tx) => {
			const bill = await tx.bill.findUnique({
				where: { code: dto.billCode },
			});

			if (!bill) {
				throw new NotFoundException('Không tìm thấy hóa đơn');
			}
			const createdIncome = await tx.billIncome.create({
				data: {
					code,
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
					debit: {
						decrement: dto.cost,
					},
				} as any,
			});
			await tx.$executeRaw`
				UPDATE "Bill"
				SET "debit" = GREATEST(0, "debit")
				WHERE "id" = ${bill.id}
			`;
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
							code: true,
						},
					},
					employee: true,
				},
			});
			if (!income)
				throw new BadRequestException('Không thể tạo phiếu thu');
			return {
				code,
				id: income.id,
				status: income.status,
				statusLabel: mapEnumToVietnamese(
					income.status,
					ENUM_VI_MAP.incomeStatus,
				),
				cost: income.cost,
				updatedAt: income.updatedAt,
				createdAt: income.createdAt,
				paymentMethod: income.paymentMethod,
				paymentMethodLabel: mapEnumToVietnamese(
					income.paymentMethod,
					ENUM_VI_MAP.incomePaymentType,
				),
				shortDescription: income.shortDescription,
				bill: {
					billId: income.billId,
					billCode: income.bill.code,
				},
				customer: {
					customerId: income.bill.customer.id,
					customerName: income.bill.customer.name ?? 'Khách vãng lai',
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
		const dataForUpdate: any = {};
		if (dto.cost) dataForUpdate.cost = dto.cost;
		if (dto.paymentMethod) dataForUpdate.paymentMethod = dto.paymentMethod;
		if (dto.shortDescription)
			dataForUpdate.shortDescription = dto.shortDescription;
		if (dto.status) dataForUpdate.status = dto.status;

		if (dto.billCode) {
			const bill = await this.prisma.bill.findUnique({
				where: { code: dto.billCode },
			});
			if (!bill) throw new BadRequestException('Không tìm thấy hóa đơn');
			dataForUpdate.billId = bill.id;
		}
		if (!income) {
			throw new NotFoundException('Không tìm thấy phiếu thu');
		}
	
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
			throw new NotFoundException('Không tìm thấy phiếu thu');
		}

		return this.prisma.billIncome.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});
	}
}
