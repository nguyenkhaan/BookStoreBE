import { PrismaService } from '@/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateOutcomeData, UpdateOutcomeData } from './dto/outcome.dto';
import { OutcomeStatus } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OutcomeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
	) {}
	async getGeneralStatistic() {
		try {
			const totalOutcomeBills =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
				});
			const completeOutcome =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
					where: {
						status: OutcomeStatus.COMPLETE,
					},
				});
			const notStartedOutcome =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
					where: { status: OutcomeStatus.CANCEL },
				});
			const totalCost = await this.prismaService.billOutcome.aggregate({
				_sum: {
					cost: true,
				},
			});
			return {
				totalOutcomeBills: totalOutcomeBills._count.id,
				completeOutcome: completeOutcome._count.id,
				notStartedOutcome: notStartedOutcome._count.id,
				totalCost: Number(totalCost._sum.cost ?? 0),
			};
		} catch (err) {
			console.log('Get outcome statistic error: ', err);
			throw err;
		}
	}
	async getAllOutcome() {
		try {
			const outcomeBills = await this.prismaService.billOutcome.findMany({
				where: { deletedAt: null },
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			return outcomeBills;
		} catch (err) {
			console.log('Get All Outcome Bills Password', err);
			throw err;
		}
	}
	async getOutcomeById(id: number) {
		try {
			const outcomeBill = await this.prismaService.billOutcome.findFirst({
				where: {
					id,
					deletedAt: null,
				},
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Bill Outcome Not Found');
			return outcomeBill;
		} catch (err) {
			console.log('Get Outcome By Id', err);
			throw err;
		}
	}
	async getOutcomeByCode(code: string) {
		try {
			const outcomeBill = await this.prismaService.billOutcome.findFirst({
				where: {
					code,
					deletedAt: null,
				},
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Bill Outcome Not Found');
			return outcomeBill;
		} catch (err) {
			console.log('Get Outcome By Id', err);
			throw err;
		}
	}
	async createOutcomeBill(
		creatorId: number,
		createOutcomeData: CreateOutcomeData,
	) {
		try {
			const results = await this.prismaService.$transaction(
				async (tx) => {
					const book = await tx.book.findFirst({
						where: { code: createOutcomeData.bookCode },
					});
					if (!book) throw new BadRequestException('Book Not Found');
					const canNhapSach =
						await this.inventoryService.canImportBookByCode(
							book.code,
							createOutcomeData.quantity,
						);
					if (!canNhapSach)
						throw new BadRequestException('Checking the number');
					//Kiem tra xem co the tien hanh nhap sach duoc hay khong ???
					const res = await tx.billOutcome.create({
						data: {
							code: createOutcomeData.code,
							cost: createOutcomeData.cost,
							status: createOutcomeData.status,
							quantity: createOutcomeData.quantity,
							publisherId: createOutcomeData.publisherId,
							employeeId: creatorId,
							bookId: book.id,
						},
					});
					//Tang so luong stock len
					await tx.inventory.update({
						where: {
							bookId: book.id,
						},
						data: {
							stock: {
								increment: createOutcomeData.quantity,
							},
						},
					});
					return res;
				},
			);
			return results;
		} catch (err) {
			console.log('Create Outcome Error: ', err);
			throw err;
		}
	}
	async updateOutcomeBill(
		billOutcomeId: number,
		updateOutcomeData: UpdateOutcomeData,
	) {
		try {
			const results = await this.prismaService.$transaction(
				async (tx) => {
					const bill = await tx.billOutcome.update({
						where: {
							id: billOutcomeId,
							deletedAt: null,
						},
						data: {
							...updateOutcomeData,
						},
					});
					if (updateOutcomeData.bookCode) {
						const book = await tx.book.findFirst({
							where: { code: updateOutcomeData.bookCode },
							select: {
								code: true,
								id: true,
							},
						});
						if (!book)
							throw new BadRequestException(
								'Book Code Not Found',
							);

						await tx.inventory.update({
							where: {
								bookId: book.id,
							},
							data: {
								stock: updateOutcomeData.quantity,
							},
						});
					}
					return bill;
				},
			);
			return results;
		} catch (err) {
			console.log('Update outcome bill err', err);
			throw err;
		}
	}
	async deleteOutcomeBill(billOutcomeId: number) {
		try {
			const bill = await this.prismaService.billOutcome.update({
				where: {
					id: billOutcomeId,
				},
				data: {
					deletedAt: new Date(),
				},
			});
			return bill;
		} catch (err) {
			console.log('Delete Outcome Bill Error: ', err);
			throw err;
		}
	}
}
