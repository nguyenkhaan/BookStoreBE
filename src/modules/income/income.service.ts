import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import { BillStatus, IncomeStatus, Prisma } from '@prisma/client';
import { ENUM_VI_MAP, mapEnumToVietnamese } from '@/utlitis/enumLocalization';

const incomeSelect = {
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
} satisfies Prisma.BillIncomeSelect;

@Injectable()
export class IncomeService {
	constructor(private prisma: PrismaService) {}

	private mapIncomeResponse(income: any) {
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
	}

	private resolveBillStatus(currentStatus: BillStatus, debit: number) {
		if (debit === 0) {
			return BillStatus.COMPLETE;
		}

		return currentStatus === BillStatus.OVERDUE
			? BillStatus.OVERDUE
			: BillStatus.NOT_STARTED;
	}

	private async updateBillDebt(
		tx: Prisma.TransactionClient,
		billId: number,
		nextDebit: number,
	) {
		const normalizedDebit = Math.max(0, Number(nextDebit) || 0);
		const currentBill = await tx.bill.findUnique({
			where: { id: billId },
			select: {
				status: true,
			},
		});

		if (!currentBill) {
			throw new NotFoundException('Không tìm thấy hóa đơn');
		}

		await tx.bill.update({
			where: { id: billId },
			data: {
				debit: normalizedDebit,
				status: this.resolveBillStatus(currentBill.status, normalizedDebit),
			},
		});
	}

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
			select: incomeSelect,
		});

		return incomes.map((income) => this.mapIncomeResponse(income));
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
		const latest = await this.prisma.billIncome.findFirst({
			orderBy: {
				id: 'desc',
			},
			select: {
				code: true,
			},
		});
		if (!latest) return `INC001`;
		console.log(latest.code) 
		return (
			'INC' +
			(Number(latest.code.replace('INC', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
	}

	async createIncome(employeeId: number, dto: CreateIncomeDto) {
		const code = await this.createIncomeCode();
		return this.prisma.$transaction(async (tx) => {
			const bill = await tx.bill.findUnique({
				where: { code: dto.billCode },
				select: {
					id: true,
					debit: true,
				},
			});

			if (!bill) {
				throw new NotFoundException('Không tìm thấy hóa đơn');
			}

			if (dto.status === IncomeStatus.COMPLETE) {
				const currentDebit = Number(bill.debit ?? 0);
				if (dto.cost > currentDebit) {
					throw new BadRequestException(
						'Số tiền thu không được vượt quá số nợ còn lại',
					);
				}
			}

			const createdIncome = await tx.billIncome.create({
				data: {
					code,
					cost: dto.cost,
					billId: bill.id,
					employeeId,
					shortDescription: dto.shortDescription,
					paymentMethod: dto.paymentMethod,
					status: dto.status,
				},
			});

			if (dto.status === IncomeStatus.COMPLETE) {
				const remain = Math.max(0, Number(bill.debit ?? 0) - dto.cost);
				await this.updateBillDebt(tx, bill.id, remain);
			}

			const income = await tx.billIncome.findUnique({
				where: { id: createdIncome.id },
				select: incomeSelect,
			});
			if (!income)
				throw new BadRequestException('Không thể tạo phiếu thu');
			return this.mapIncomeResponse(income);
		});
	}

	async updateIncome(id: number, dto: UpdateIncomeDto) {
		return this.prisma.$transaction(async (tx) => {
			const income = await tx.billIncome.findUnique({
				where: { id },
				include: {
					bill: {
						select: {
							id: true,
							debit: true,
							status: true,
						},
					},
				},
			});
			if (!income || income.deletedAt) {
				throw new NotFoundException('Không tìm thấy phiếu thu');
			}

			let targetBill = income.bill;
			if (dto.billCode) {
				const bill = await tx.bill.findUnique({
					where: { code: dto.billCode },
					select: {
						id: true,
						debit: true,
						status: true,
					},
				});
				if (!bill) throw new BadRequestException('Không tìm thấy hóa đơn');
				targetBill = bill;
			}

			const nextStatus = dto.status ?? income.status;
			const nextCost = Number(dto.cost ?? income.cost);
			if (nextCost <= 0) {
				throw new BadRequestException('Số tiền thu phải lớn hơn 0');
			}

			const availableDebit =
				targetBill.id === income.bill.id && income.status === IncomeStatus.COMPLETE
					? Number(targetBill.debit ?? 0) + Number(income.cost)
					: Number(targetBill.debit ?? 0);

			if (
				nextStatus === IncomeStatus.COMPLETE &&
				nextCost > Math.max(0, availableDebit)
			) {
				throw new BadRequestException(
					'Số tiền thu không được vượt quá số nợ còn lại',
				);
			}

			if (income.status === IncomeStatus.COMPLETE) {
				await this.updateBillDebt(
					tx,
					income.bill.id,
					Number(income.bill.debit ?? 0) + Number(income.cost),
				);
			}

			if (nextStatus === IncomeStatus.COMPLETE) {
				const targetBillRefreshed = await tx.bill.findUnique({
					where: { id: targetBill.id },
					select: {
						id: true,
						debit: true,
					},
				});
				if (!targetBillRefreshed) {
					throw new NotFoundException('Không tìm thấy hóa đơn');
				}

				await this.updateBillDebt(
					tx,
					targetBillRefreshed.id,
					Number(targetBillRefreshed.debit ?? 0) - nextCost,
				);
			}

			await tx.billIncome.update({
				where: { id },
				data: {
					cost: nextCost,
					paymentMethod: dto.paymentMethod ?? income.paymentMethod,
					shortDescription:
						dto.shortDescription ?? income.shortDescription,
					status: nextStatus,
					billId: targetBill.id,
				},
			});

			const updatedIncome = await tx.billIncome.findUnique({
				where: { id },
				select: incomeSelect,
			});
			if (!updatedIncome) {
				throw new NotFoundException('Không tìm thấy phiếu thu');
			}

			return this.mapIncomeResponse(updatedIncome);
		});
	}

	async deleteIncome(id: number) {
		return this.prisma.$transaction(async (tx) => {
			const income = await tx.billIncome.findUnique({
				where: { id },
				include: {
					bill: {
						select: {
							id: true,
							debit: true,
						},
					},
				},
			});

			if (!income || income.deletedAt) {
				throw new NotFoundException('Không tìm thấy phiếu thu');
			}

			await tx.billIncome.update({
				where: { id },
				data: {
					deletedAt: new Date(),
				},
			});

			if (income.status === IncomeStatus.COMPLETE) {
				await this.updateBillDebt(
					tx,
					income.bill.id,
					Number(income.bill.debit ?? 0) + Number(income.cost),
				);
			}

			return { success: true };
		});
	}
}
