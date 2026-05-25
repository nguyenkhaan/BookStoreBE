import { PrismaService } from '@/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	CreateOutcomeData,
	CreateOutcomeItemDto,
	UpdateOutcomeData,
} from './dto/outcome.dto';
import { Book, BookCategory, OutcomeStatus, Prisma } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { SettingService } from '../settings/settings.service';

type OutcomeItemSnapshot = {
	id: number;
	bookId: number;
	quantity: number;
	unitCost: Prisma.Decimal;
	book?: {
		code: string;
	};
};

type ProcessedOutcomeItem = {
	bookId: number;
	quantity: number;
	unitCost: number;
};

type ImportSettings = {
	minImportQuantity: number;
	retailPriceRatio: number;
	maxStock: number;
	minInventory : number 
};

@Injectable()
export class OutcomeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
		private readonly settingService: SettingService,
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
			status: outcome.status,
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

	private async loadImportSettings(): Promise<ImportSettings> {
		const [minImportQuantity, retailPriceRatio, maxStock , minInventory] =
			await Promise.all([
				this.settingService.getSettingValue('STOCK_IMPORT_NUMBER_MIN'),
				this.settingService.getSettingValue('TI_GIA_BAN'),
				this.settingService.getSettingValue('STOCK_MAX'), 
				this.settingService.getSettingValue('STOCK_MIN') 
			]);

		return {
			minImportQuantity,
			retailPriceRatio,
			maxStock,
			minInventory 
		};
	}

	private validateImportItems(
		items: CreateOutcomeItemDto[],
		minImportQuantity: number,
	) {
		if (items.length === 0) {
			throw new BadRequestException(
				'Phiếu nhập phải có ít nhất một sách',
			);
		}

		const seenCodes = new Set<string>();

		for (const item of items) {
			if (item.quantity < minImportQuantity) {
				throw new BadRequestException(
					`Sách ${item.code} không đạt số lượng nhập tối thiểu (${minImportQuantity})`,
				);
			}

			if (seenCodes.has(item.code)) {
				throw new BadRequestException(
					`Mã sách ${item.code} bị trùng trong phiếu nhập. Vui lòng gộp số lượng vào một dòng.`,
				);
			}

			seenCodes.add(item.code);
		}
	}

	private calculateRetailPrice(
		baseCost: number,
		retailPriceRatio: number,
	): number {
		return baseCost * retailPriceRatio;
	}

	private async findActiveBookByCode(
		tx: Prisma.TransactionClient,
		code: string,
	) {
		return tx.book.findFirst({
			where: {
				code,
				deletedAt: null,
			},
		});
	}

	private async createBookFromImportItem(
		tx: Prisma.TransactionClient,
		item: CreateOutcomeItemDto,
		retailPrice: number,
	): Promise<Book> {
		if (!item.bookTitle) {
			throw new BadRequestException(
				`Thiếu tiêu đề cho sách mới ${item.code}`,
			);
		}

		return tx.book.create({
			data: {
				code: item.code,
				title: item.bookTitle,
				year: item.year ?? new Date().getFullYear(),
				cost: retailPrice,
				category: BookCategory.GIAO_DUC,
				publishers: {
					create:
						item.publisherIds?.map((publisherId) => ({
							publisher: {
								connect: {
									id: publisherId,
								},
							},
						})) ?? [],
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
	}

	private async importStockForExistingBook(
		tx: Prisma.TransactionClient,
		book: Book,
		item: CreateOutcomeItemDto,
		retailPrice: number,
		settings: ImportSettings,
	) {
		const canImport =
			await this.inventoryService.canImportBookInTransaction(
				tx,
				book.id,
				item.quantity,
				settings.minInventory , 
				settings.maxStock,
				
			
			);

		if (!canImport) {
			throw new BadRequestException(
				`Số lượng nhập không hợp lệ cho sách ${book.code}. Đảm bảo sách không vượt quá giới hạn trong kho và số sách còn lại đủ ít để nhập `,
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

		await tx.book.update({
			where: {
				id: book.id,
			},
			data: {
				cost: retailPrice,
			},
		});
	}

	private async processImportItems(
		tx: Prisma.TransactionClient,
		items: CreateOutcomeItemDto[],
		settings: ImportSettings,
	): Promise<{ processedItems: ProcessedOutcomeItem[]; totalCost: number }> {
		this.validateImportItems(items, settings.minImportQuantity);

		const processedItems: ProcessedOutcomeItem[] = [];
		let totalCost = 0;

		for (const item of items) {
			const baseCost = Number(item.baseCost ?? 0);
			const retailPrice = this.calculateRetailPrice(
				baseCost,
				settings.retailPriceRatio,
			);

			let book = await this.findActiveBookByCode(tx, item.code);

			if (!book) {
				book = await this.createBookFromImportItem(
					tx,
					item,
					retailPrice,
				);
			} else {
				await this.importStockForExistingBook(
					tx,
					book,
					item,
					retailPrice,
					settings,
				);
			}

			totalCost += baseCost * item.quantity;
			processedItems.push({
				bookId: book.id,
				quantity: item.quantity,
				unitCost: baseCost,
			});
		}

		return { processedItems, totalCost };
	}

	private async revertOutcomeItemInventory(
		tx: Prisma.TransactionClient,
		items: OutcomeItemSnapshot[],
	) {
		for (const item of items) {
			const inventory = await tx.inventory.findUnique({
				where: { bookId: item.bookId },
			});
			const currentStock = inventory?.stock ?? 0;

			if (currentStock < item.quantity) {
				throw new BadRequestException(
					`Không thể hoàn tác phiếu nhập cho sách ${item.book?.code ?? item.bookId}: tồn kho hiện tại (${currentStock}) nhỏ hơn số lượng đã nhập (${item.quantity})`,
				);
			}

			await tx.inventory.update({
				where: { bookId: item.bookId },
				data: {
					stock: {
						decrement: item.quantity,
					},
				},
			});
		}
	}

	private async softDeleteOutcomeItems(
		tx: Prisma.TransactionClient,
		itemIds: number[],
	) {
		if (itemIds.length === 0) {
			return;
		}

		await tx.billOutcomeItem.updateMany({
			where: {
				id: { in: itemIds },
				deleteAt: null,
			},
			data: {
				deleteAt: new Date(),
			},
		});
	}

	private async fetchOutcomeBillOrThrow(
		tx: Prisma.TransactionClient,
		billOutcomeId: number,
		includeItems = false,
	) {
		const bill = await tx.billOutcome.findFirst({
			where: {
				id: billOutcomeId,
				deletedAt: null,
			},
			select: {
				id: true,
				...(includeItems
					? {
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
											code: true,
										},
									},
								},
							},
						}
					: {}),
			},
		});

		if (!bill) {
			throw new NotFoundException('Không tìm thấy phiếu nhập');
		}

		return bill;
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
		return (
			'OUT' +
			(Number(latest.code.replace('OUT', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
	}

	async getGeneralStatistic() {
		try {
			const totalOutcomeBills =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
					where: { deletedAt: null },
				});
			const completeOutcome =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
					where: {
						status: OutcomeStatus.COMPLETE,
						deletedAt: null,
					},
				});
			const notStartedOutcome =
				await this.prismaService.billOutcome.aggregate({
					_count: { id: true },
					where: {
						status: OutcomeStatus.CANCEL,
						deletedAt: null,
					},
				});
			const totalCost = await this.prismaService.billOutcome.aggregate({
				_sum: {
					cost: true,
				},
				where: { deletedAt: null },
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
				orderBy: [
					{updatedAt: 'desc'}, 
					{createdAt: 'desc'}
				]
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
			const settings = await this.loadImportSettings();
			const code = await this.createOutcomeCode();

			const result = await this.prismaService.$transaction(async (tx) => {
				const { processedItems, totalCost } =
					await this.processImportItems(
						tx,
						createOutcomeData.items,
						settings,
					);

				return tx.billOutcome.create({
					data: {
						code,
						publisherId: createOutcomeData.publisherId,
						employeeId: creatorId,
						status: createOutcomeData.status,
						cost: totalCost,
						outcomeItems: {
							create: processedItems,
						},
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
			});

			return this.formatOutcomeForFrontend(result);
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
			const settings = await this.loadImportSettings();

			const result = await this.prismaService.$transaction(async (tx) => {
				const existingBill = await this.fetchOutcomeBillOrThrow(
					tx,
					billOutcomeId,
					true,
				);
				const existingItems =
					'outcomeItems' in existingBill
						? (existingBill.outcomeItems as OutcomeItemSnapshot[])
						: [];

				if (updateOutcomeData.items) {
					await this.revertOutcomeItemInventory(tx, existingItems);
					await this.softDeleteOutcomeItems(
						tx,
						existingItems.map((item) => item.id),
					);

					const { processedItems, totalCost } =
						await this.processImportItems(
							tx,
							updateOutcomeData.items,
							settings,
						);

					await tx.billOutcomeItem.createMany({
						data: processedItems.map((item) => ({
							outcomeId: billOutcomeId,
							bookId: item.bookId,
							quantity: item.quantity,
							unitCost: item.unitCost,
						})),
					});

					return tx.billOutcome.update({
						where: { id: billOutcomeId },
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
				}

				if (
					updateOutcomeData.status === undefined &&
					updateOutcomeData.publisherId === undefined
				) {
					throw new BadRequestException(
						'Không có dữ liệu cập nhật cho phiếu nhập',
					);
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
					where: { id: billOutcomeId },
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
			});

			return this.formatOutcomeForFrontend(result);
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

				if (!existingBill)
					throw new NotFoundException('Không tìm thấy phiếu nhập');

				const activeItems = existingBill.outcomeItems.map((item) => ({
					id: item.id,
					bookId: item.bookId,
					quantity: item.quantity,
					unitCost: item.unitCost,
					book: {
						code: item.book.code,
					},
				}));

				await this.revertOutcomeItemInventory(tx, activeItems);

				await this.softDeleteOutcomeItems(
					tx,
					activeItems.map((item) => item.id),
				);

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
