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
import { SettingService } from '../settings/settings.service';
// Clm AI ganh cong lung cai file nay
@Injectable()
export class OutcomeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
		private readonly settingService : SettingService
	) {}

	private formatOutcomeForFrontend(outcome: {
		id: number;
		code: string;
		cost: unknown;
		status: OutcomeStatus;
		publisherId: number;
		employeeId: number;
		createdAt: Date;
		updatedAt: Date;
		publisher?: {
			id: number;
			name: string;
		};
		creator?: {
			id: number;
			name: string;
		};
		book?: {
			id: number;
			code: string;
			title: string;
			cost: unknown;
			year: number;
			category: BookCategory;
		};
		bookId?: number;
		quantity?: number;
		outcomeItems?: Array<{
			bookId: number;
			quantity: number;
			unitCost: unknown;
			book: {
				id: number;
				code: string;
				title: string;
				cost: unknown;
				year: number;
				category: BookCategory;
			};
		}>;
	}) {
		const totalCost = Number(outcome.cost);
		const outcomeItems = outcome.outcomeItems ?? [];
		const firstItem = outcomeItems[0];
		const quantity =
			outcome.quantity !== undefined
				? Number(outcome.quantity)
				: outcomeItems.reduce(
						(sum, item) => sum + Number(item.quantity),
						0,
					);
		const bookId = outcome.bookId ?? firstItem?.bookId ?? null;
		const book = outcome.book ?? firstItem?.book ?? null;
		const unitCost =
			firstItem !== undefined
				? Number(firstItem.unitCost)
				: quantity > 0
					? totalCost / quantity
					: 0;

		return {
			id: outcome.id,
			code: outcome.code,
			status: mapEnumToVietnamese(
				outcome.status,
				ENUM_VI_MAP.outcomeStatus,
			),
			publisherId: outcome.publisherId,
			publisherName: outcome.publisher?.name ?? null,
			employeeId: outcome.employeeId,
			bookId,
			createdBy: outcome.creator?.name ?? null,
			cost: totalCost,
			quantity,
			createdAt: outcome.createdAt,
			updatedAt: outcome.updatedAt,
			book: book
				? {
						id: book.id,
						code: book.code,
						title: book.title,
						cost: Number(book.cost),
						year: book.year,
						category: book.category,
					}
				: null,
			bookItemList:
				outcomeItems.length > 0
					? outcomeItems.map((item) => ({
							bookId: item.book.id,
							bookCode: item.book.code,
							bookTitle: item.book.title,
							bookCost: Number(item.book.cost),
							importUnitCost: Number(item.unitCost),
							quantity: item.quantity,
							lineTotal: Number(item.unitCost) * item.quantity,
							year: item.book.year,
							category: item.book.category,
						}))
					: book
						? [
								{
									bookId: book.id,
									bookCode: book.code,
									bookTitle: book.title,
									bookCost: Number(book.cost),
									importUnitCost: unitCost,
									quantity,
									lineTotal: totalCost,

									year: book.year,
									category: book.category,
								},
							]
						: [],
		};
	}

	private getOutcomeInclude() {
		return {
			publisher: {
				select: {
					id: true,
					name: true,
				},
			},
			creator: {
				select: {
					id: true,
					name: true,
				},
			},
			outcomeItems: {
				where: {
					deleteAt: null,
				},
				select: {
					id: true,
					bookId: true,
					quantity: true,
					unitCost: true,
					book: {
						select: {
							id: true,
							code: true,
							title: true,
							cost: true,
							year: true,
							category: true,
						},
					},
				},
			},
		};
	}

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
					publisherId: true,
					employeeId: true,
					createdAt: true,
					updatedAt: true,
					...this.getOutcomeInclude(),
				},
			});
			return outcomeBills.map((item) =>
				this.formatOutcomeForFrontend(item),
			);
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
					publisherId: true,
					employeeId: true,
					cost: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					...this.getOutcomeInclude(),
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Không tìm thấy phiếu nhập');
			return this.formatOutcomeForFrontend(outcomeBill);
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
					publisherId: true,
					employeeId: true,
					cost: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					...this.getOutcomeInclude(),
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Không tìm thấy phiếu nhập');
			return this.formatOutcomeForFrontend(outcomeBill);
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
			const code = await this.createOutcomeCode();

			const result = await this.prismaService.$transaction(async (tx) => {
				const outcomeItemsData: any[] = [];

				let totalCost = 0;

				for (const item of createOutcomeData.items) {
					if (item.quantity < (await this.settingService.getSettingValue('STOCK_IMPORT_NUMBER_MIN'))) 
						throw new BadRequestException('Không đạt số lượng sách tối thiểu khi nhập')
					let book = await tx.book.findFirst({
						where: {
							code: item.code,
						},
					});

					const baseCost = Number(item.baseCost ?? 0);

					/**
					 * Giá bán = giá nhập + 5%
					 */
					const retailPrice = baseCost * (await this.settingService.getSettingValue('TI_GIA_BAN'));

					/**
					 * Nếu sách chưa tồn tại -> tạo mới
					 */
					if (!book) {
						
						if (!item.bookTitle) {
							throw new BadRequestException(
								`Thiếu tiêu đề cho sách mới ${item.code}`,
							);
						}

						book = await tx.book.create({
							data: {
								code: item.code,

								title: item.bookTitle,

								year: item.year ?? new Date().getFullYear(),

								cost: retailPrice,

								category: BookCategory.GIAO_DUC,

								publishers: {
									create:
										item.publisherIds?.map(
											(publisherId) => ({
												publisher: {
													connect: {
														id: publisherId,
													},
												},
											}),
										) ?? [],
								},

								authors: {
									create:
										item.authorIds?.map((authorId) => ({
											author: {
												connect: {
													id: authorId,
												},
											},
										})) ?? [],
								},

								inventory: {
									create: {
										stock: item.quantity,
									},
								},
							},
						});
					} else {
						const canImport =
							await this.inventoryService.canImportBookByCode(
								book.code,
								item.quantity,
							);

						if (!canImport) {
							throw new BadRequestException(
								`Số lượng nhập không hợp lệ cho sách ${book.code}`,
							);
						}

						await tx.inventory.upsert({
							where: {
								bookId: book.id,
							},
							update: {
								stock: {
									increment: item.quantity,
								},
							},
							create: {
								bookId: book.id,
								stock: item.quantity,
							},
						});

						/**
						 * Update giá sách mới nhất
						 */
						await tx.book.update({
							where: {
								id: book.id,
							},
							data: {
								cost: retailPrice,
							},
						});
					}

					/**
					 * Tính tổng tiền phiếu nhập
					 */
					totalCost += baseCost * item.quantity;

					/**
					 * Chuẩn bị dữ liệu BillOutcomeItem
					 */
					outcomeItemsData.push({
						bookId: book.id,

						quantity: item.quantity,

						unitCost: baseCost,
					});
				}

				/**
				 * Tạo BillOutcome + nested BillOutcomeItem
				 */
				const createdOutcome = await tx.billOutcome.create({
					data: {
						code,

						publisherId: createOutcomeData.publisherId,

						employeeId: creatorId,

						status: createOutcomeData.status,

						cost: totalCost,

						outcomeItems: {
							create: outcomeItemsData,
						},
					},

					include: {
						publisher: {
							select: {
								id: true,
								name: true,
							},
						},

						creator: {
							select: {
								id: true,
								name: true,
							},
						},

						outcomeItems: {
							include: {
								book: {
									select: {
										id: true,
										code: true,
										title: true,
										cost: true,
										year: true,
										category: true,
									},
								},
							},
						},
					},
				});

				return createdOutcome;
			});

			/**
			 * Giữ nguyên response format cũ
			 */
			const formattedResults = result.outcomeItems.map((item) => ({
				id: result.id,

				code: result.code,

				publisherId: result.publisherId,

				employeeId: result.employeeId,

				bookId: item.bookId,

				cost: Number(item.unitCost) * item.quantity,

				status: result.status,

				quantity: item.quantity,

				createdAt: result.createdAt,

				updatedAt: result.updatedAt,

				publisher: result.publisher,

				creator: result.creator,

				book: item.book,
			}));

			return formattedResults.map((item) =>
				this.formatOutcomeForFrontend(item),
			);
		} catch (err) {
			console.log('Create Outcome Error:', err);
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
					const existingBill = await tx.billOutcome.findFirst({
						where: {
							id: billOutcomeId,
							deletedAt: null,
						},
						select: {
							id: true,
							outcomeItems: {
								where: {
									deleteAt: null,
								},
								select: {
									id: true,
									bookId: true,
									quantity: true,
									unitCost: true,
								},
							},
						},
					});

					if (!existingBill)
						throw new NotFoundException(
							'Không tìm thấy phiếu nhập',
						);

					const firstItem = existingBill.outcomeItems[0];

					if (
						(updateOutcomeData.code ||
							updateOutcomeData.baseCost !== undefined ||
							updateOutcomeData.quantity !== undefined) &&
						!firstItem
					) {
						throw new BadRequestException(
							'Phiếu nhập chưa có sách để cập nhật',
						);
					}

					if (firstItem) {
						let targetBookId = firstItem.bookId;
						let targetQuantity = firstItem.quantity;

						if (updateOutcomeData.code) {
							const book = await tx.book.findFirst({
								where: { code: updateOutcomeData.code },
								select: {
									id: true,
								},
							});
							if (!book)
								throw new BadRequestException(
									'Không tìm thấy mã sách',
								);
							targetBookId = book.id;
						}

						if (updateOutcomeData.quantity !== undefined) {
							targetQuantity = updateOutcomeData.quantity;
						}

						if (
							updateOutcomeData.code &&
							targetBookId !== firstItem.bookId
						) {
							await tx.inventory.update({
								where: {
									bookId: firstItem.bookId,
								},
								data: {
									stock: {
										decrement: firstItem.quantity,
									},
								},
							});

							await tx.inventory.upsert({
								where: {
									bookId: targetBookId,
								},
								update: {
									stock: {
										increment: targetQuantity,
									},
								},
								create: {
									bookId: targetBookId,
									stock: targetQuantity,
								},
							});
						} else if (updateOutcomeData.quantity !== undefined) {
							const delta = targetQuantity - firstItem.quantity;
							if (delta !== 0) {
								await tx.inventory.update({
									where: {
										bookId: targetBookId,
									},
									data: {
										stock: {
											increment: delta,
										},
									},
								});
							}
						}

						await tx.billOutcomeItem.update({
							where: {
								id: firstItem.id,
							},
							data: {
								bookId: targetBookId,
								quantity: targetQuantity,
								...(updateOutcomeData.baseCost !==
									undefined && {
									unitCost: updateOutcomeData.baseCost,
								}),
							},
						});

						if (updateOutcomeData.baseCost !== undefined) {
							await tx.book.update({
								where: {
									id: targetBookId,
								},
								data: {
									cost:
										Number(updateOutcomeData.baseCost) *
										(await this.settingService.getSettingValue('TI_GIA_BAN'))
								},
							});
						}
					}

					const activeItems = await tx.billOutcomeItem.findMany({
						where: {
							outcomeId: billOutcomeId,
							deleteAt: null,
						},
						select: {
							quantity: true,
							unitCost: true,
						},
					});

					const totalCost = activeItems.reduce(
						(sum, item) =>
							sum + Number(item.unitCost) * item.quantity,
						0,
					);

					return tx.billOutcome.update({
						where: {
							id: billOutcomeId,
						},
						data: {
							...(updateOutcomeData.status && {
								status: updateOutcomeData.status,
							}),
							...(updateOutcomeData.publisherId && {
								publisherId: updateOutcomeData.publisherId,
							}),
							cost: totalCost,
						},
						select: {
							id: true,
							code: true,
							publisherId: true,
							employeeId: true,
							cost: true,
							status: true,
							createdAt: true,
							updatedAt: true,
							...this.getOutcomeInclude(),
						},
					});
				},
			);
			return this.formatOutcomeForFrontend(results);
		} catch (err) {
			console.log('Update outcome bill err', err);
			throw err;
		}
	}
	async deleteOutcomeBill(billOutcomeId: number) {
		try {
			const bill = await this.prismaService.$transaction(async (tx) => {
				const existingBill = await tx.billOutcome.findFirst({
					where: {
						id: billOutcomeId,
					},
					select: {
						id: true,
						code: true,
						publisherId: true,
						employeeId: true,
						cost: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						...this.getOutcomeInclude(),
					},
				});

				if (!existingBill)
					throw new NotFoundException('Không tìm thấy phiếu nhập');

				await tx.billOutcomeItem.updateMany({
					where: {
						outcomeId: billOutcomeId,
						deleteAt: null,
					},
					data: {
						deleteAt: new Date(),
					},
				});

				await tx.billOutcome.update({
					where: {
						id: billOutcomeId,
					},
					data: {
						deletedAt: new Date(),
					},
				});

				return existingBill;
			});
			return this.formatOutcomeForFrontend(bill);
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
