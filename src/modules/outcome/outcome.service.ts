import { PrismaService } from '@/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateOutcomeData, UpdateOutcomeData } from './dto/outcome.dto';
import { BookCategory, OutcomeStatus } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { ENUM_VI_MAP, mapEnumToVietnamese } from '@/utlitis/enumLocalization';
import { TI_GIA_BAN } from '@/bases/commons/constants/app.constant';

@Injectable()
export class OutcomeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
	) {}
	async createOutcomeCode() {
		const latest = await this.prismaService.billOutcome.findFirst({
			orderBy: {
				id: 'desc',
			},
			select: {
				code: true,
			},
		});
		if (!latest) return `OUT001`;
		// return `OUT${latest.code.toString().padStart(3, '0')}`;
		return (
			'OUT' +
			(Number(latest.code.replace('OUT', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
		// return `OUT${code.toString().padStart(3, '0')}`;
	}

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
					quantity: true,
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
			return outcomeBills.map((item) => ({
				...item,
				status: mapEnumToVietnamese(
					item.status,
					ENUM_VI_MAP.outcomeStatus,
				),
			}));
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
				throw new NotFoundException('Không tìm thấy phiếu nhập');
			return {
				...outcomeBill,
				status: mapEnumToVietnamese(
					outcomeBill.status,
					ENUM_VI_MAP.outcomeStatus,
				),
			};
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
					quantity: true,
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
				throw new NotFoundException('Không tìm thấy phiếu nhập');
			return {
				...outcomeBill,
				status: mapEnumToVietnamese(
					outcomeBill.status,
					ENUM_VI_MAP.outcomeStatus,
				),
			};
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
			let code = await this.createOutcomeCode();
			const results = await this.prismaService.$transaction(
				async (tx) => {
					const createdBills: any[] = [];
					for (const item of createOutcomeData.items) {
						let book = await tx.book.findFirst({
							where: { code: item.code },
						});
						const baseCost = Number(item.baseCost ?? 0);
						const retailPrice = baseCost * 1.05;
						if (!book) {
							if (!item.bookTitle)
								throw new BadRequestException(
									`Thiếu thông tin tiêu đề cho sách mới ${item.code}`,
								);
							book = await tx.book.create({
								data: {
									code: item.code,
									title: item.bookTitle,
									year: item.year ?? new Date().getFullYear(),
									cost: retailPrice,
									category: BookCategory.GIAO_DUC,
									inventory: {
										create: {
											stock: item.quantity,
										},
									},
								},
							});
						} else {
							const canNhapSach =
								await this.inventoryService.canImportBookByCode(
									book.code,
									item.quantity,
								);
							if (!canNhapSach)
								throw new BadRequestException(
									`Số lượng nhập không hợp lệ cho sách ${book.code}`,
								);
							await tx.inventory.upsert({
								where: { bookId: book.id },
								update: { stock: { increment: item.quantity } },
								create: {
									bookId: book.id,
									stock: item.quantity,
								},
							});
						}

						await tx.book.update({
							where: { id: book.id },
							data: { cost: retailPrice },
						});

						const created = await tx.billOutcome.create({
							data: {
								code,
								cost: baseCost * item.quantity,
								status: createOutcomeData.status,
								quantity: item.quantity,
								publisherId: createOutcomeData.publisherId,
								employeeId: creatorId,
								bookId: book.id,
							},
						});
						createdBills.push(created);
						code = `OUT${(1 + Number(code.replace('OUT', ''))).toString().padStart(3, '0')}`;
						console.log('Code', code);
					}
					return createdBills;
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
							...(updateOutcomeData.code && {
								code: updateOutcomeData.code,
							}),
							...(updateOutcomeData.baseCost !== undefined && {
								cost: updateOutcomeData.baseCost * 1.05,
							}),
							...(updateOutcomeData.status && {
								status: updateOutcomeData.status,
							}),
							...(updateOutcomeData.quantity !== undefined && {
								quantity: updateOutcomeData.quantity,
							}),
							...(updateOutcomeData.publisherId && {
								publisherId: updateOutcomeData.publisherId,
							}),
						},
					});
					if (updateOutcomeData.code) {
						const book = await tx.book.findFirst({
							where: { code: updateOutcomeData.code },
							select: {
								code: true,
								id: true,
							},
						});
						if (!book)
							throw new BadRequestException(
								'Không tìm thấy mã sách',
							);

						await tx.inventory.update({
							where: {
								bookId: book.id,
							},
							data: {
								stock: updateOutcomeData.quantity,
							},
						});
						if (updateOutcomeData.baseCost !== undefined) {
							await tx.book.update({
								where: { id: book.id },
								data: {
									cost: updateOutcomeData.baseCost * TI_GIA_BAN,
								},
							});
						}
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

/**
 * Luồng hoạt động:
 * 1. Nhập thông tin về các cuốn sách
 *
 */
