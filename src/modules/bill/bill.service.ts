import { PrismaService } from '@/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
} from '@nestjs/common';
import { BillStatus, VoucherStatus, VoucherType } from '@prisma/client';
import { CreateBillData, UpdateBillData } from './dto/bill.dto';
import { InventoryService } from '../inventory/inventory.service';
import { CustomerService } from '../customer/customer.service';
import { ENUM_VI_MAP, mapEnumToVietnamese } from '@/utlitis/enumLocalization';
import { SettingService } from '../settings/settings.service';
// import { VoucherService } from '../voucher/voucher.service';
@Injectable()
export class BillService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
		private readonly customerService: CustomerService,
		private readonly settingService : SettingService
	) {}
	async getGeneralStatistic() {
		try {
			const totalBills = await this.prismaService.bill.aggregate({
				_count: { id: true },
			});
			const completeBills = await this.prismaService.bill.aggregate({
				_count: { code: true },
				where: {
					status: BillStatus.COMPLETE,
				},
			});
			const overdueBills = await this.prismaService.bill.aggregate({
				_count: { code: true },
				where: {
					status: BillStatus.OVERDUE,
				},
			});
			const notStartedBills =
				totalBills._count.id -
				completeBills._count.code -
				overdueBills._count.code;
			return {
				totalBills: totalBills._count.id,
				completeBills: completeBills._count.code,
				overdueBills: overdueBills._count.code,
				notStartedBills,
			};
		} catch (err) {
			console.log('Get Bill statistic error', err);
			throw err;
		}
	}
	async getAllBills() {
		try {
			const bills = await this.prismaService.bill.findMany({
				include: {
					customer: true,
					billDetail: {
						include: { book: true },
					},
					voucherUsage: {
						include: { voucher: true },
					},
				},
			});
			const resultBills = bills.map((bill) => {
				return {
					...bill,
					statusLabel: mapEnumToVietnamese(
						bill.status,
						ENUM_VI_MAP.billStatus,
					),
					customer: {
						id: bill.customer.id,
						name: bill.customer.name ?? 'Khách vãng lai',
						email: bill.customer.email ?? 'Chưa có thông tin',
						code: bill.customer.code ?? 'Chưa có thông tin',
						phone: bill.customer.phone,
					},

					voucherUsage: bill.voucherUsage.map((usage) => {
						return {
							usedAt: usage.usedAt,
							...usage.voucher,
							sale: Number(usage.voucher.sale),
						};
					}),
					billDetail: bill.billDetail.map((detail) => {
						return {
							...detail.book,
							quantity: detail.quantity,
						};
					}),
				};
			});
			return resultBills;
		} catch (err) {
			console.log('Get All Bills Error: ', err);
			throw err;
		}
	}
	async createBillCode() {
		//Using for auto generating bill code
		const latest = await this.prismaService.bill.findFirst({
			orderBy: {
				id: 'desc',
			},
			select: {
				code: true,
			},
		});
		if (!latest) return `HD001`;
		return (
			'HD' +
			(Number(latest.code.replace('HD', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
	}
	async deleteBill(id: number) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				// Get bill details to restore inventory
				const billDetails = await tx.billDetail.findMany({
					where: { billId: id },
				});

				// Restore inventory for each item
				for (const detail of billDetails) {
					await tx.inventory.update({
						where: { bookId: detail.bookId },
						data: {
							stock: {
								increment: detail.quantity,
							},
						},
					});
				}

				// Restore voucher quantities
				const voucherUsages = await tx.voucherUsage.findMany({
					where: { billId: id },
				});

				for (const usage of voucherUsages) {
					await tx.voucher.update({
						where: { id: usage.voucherId },
						data: {
							quantity: {
								increment: 1,
							},
						},
					});
				}

				// Delete related records
				await tx.billDetail.deleteMany({
					where: { billId: id },
				});

				await tx.voucherUsage.deleteMany({
					where: { billId: id },
				});

				await tx.billIncome.deleteMany({
					where: { billId: id },
				});

				// Delete the bill
				const deletedBill = await tx.bill.delete({
					where: { id },
				});

				return deletedBill;
			});
		} catch (err) {
			console.log('Delete Bill Error:', err);
			throw err;
		}
	}
	async createBill(createBillData: CreateBillData) {
		try {
			const code = await this.createBillCode();
			let customer = await this.prismaService.customer.findUnique({
				where: { phone: createBillData.customerPhone },
			});
			if (!customer) {
				customer = await this.customerService.createStrangeCustomer(
					createBillData.customerPhone,
				);
			}
			return await this.prismaService.$transaction(async (tx) => {
				const bookCodes = createBillData.billDetails.map(
					(b) => b.bookCode,
				);

				const books = await tx.book.findMany({
					where: { code: { in: bookCodes } },
					include: {
						inventory: true,
					},
				});

				const bookMap = new Map(books.map((b) => [b.code, b]));

				let totalCost = 0;

				for (const item of createBillData.billDetails) {
					const book = bookMap.get(item.bookCode);

					if (!book)
						throw new BadRequestException('Không tìm thấy sách');

					const canSellBook =
						await this.inventoryService.canSellBookByCode(
							book.code,
							item.quantity,
						);
					if (canSellBook == false)
						throw new BadRequestException(
							'Không thể bán vì vi phạm quy định tồn kho tối thiểu',
						);
					totalCost += item.quantity * Number(book.cost);
					const updated = await tx.inventory.update({
						where: {
							bookId: book.id,
							stock: {
								gte: item.quantity,
							},
						},
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
					});
					if (updated.stock == 0)
						throw new BadRequestException(
							'Không đủ số lượng sách trong kho',
						);
				}
				//Voucher
				const voucherUsageData = [];

				if (createBillData.vouchers) {
					for (const v of createBillData.vouchers) {
						const voucher = await tx.voucher.findUnique({
							where: { id: v.voucherId },
						});

						if (
							!voucher ||
							voucher.status === VoucherStatus.ENDED ||
							voucher.deletedAt != null ||
							voucher.expiresAt < new Date() ||
							voucher.quantity <= 0
						)
							throw new BadRequestException(
								'Voucher không hợp lệ',
							);

						if (voucher.type === VoucherType.PERCENT)
							totalCost = Math.max(
								0,
								totalCost -
									(totalCost * Number(voucher.sale)) / 100,
							);
						else
							totalCost = Math.max(
								0,
								totalCost - Number(voucher.sale),
							);

						//Decrrease voucher
						await tx.voucher.update({
							where: { id: voucher.id },
							data: {
								quantity: {
									decrement: 1,
								},
							},
						});

						voucherUsageData.push({
							voucherId: voucher.id,
						});
					}
				}
				//Tinh no cua mot khach hang

				const _totalDebit = (await tx.bill.aggregate({
					_sum: { debit: true },
					where: {
						customerId: customer.id,
					},
				} as any)) as any;
				//Tinh no cua khach hang
				if (
					Number(_totalDebit?._sum?.debit ?? 0) +
						(totalCost -
							Number(createBillData.temporaryCost || 0)) >
					(await this.settingService.getSettingValue('DEBIT_MAX'))
				)
					throw new BadRequestException(
						'Công nợ của khách hàng đã vượt ngưỡng cho phép',
					);
				const bill = await tx.bill.create({
					data: {
						code,
						customerId: customer.id,
						status: createBillData.status,
						cost: totalCost,
					},
				});
				const billDebit = Math.max(
					0,
					totalCost - Number(createBillData.temporaryCost || 0),
				);
				await tx.$executeRaw`
					UPDATE "Bill"
					SET "debit" = ${billDebit}
					WHERE "id" = ${bill.id}
				`;

				if (createBillData.billDetails) {
					const billDetailData = createBillData.billDetails.map(
						(b) => {
							const book = bookMap.get(b.bookCode);
							if (!book)
								throw new BadRequestException(
									`Không tìm thấy sách có mã ${b.bookCode}`,
								);
							return {
								bookId: book.id,
								quantity: b.quantity,
								billId: bill.id,
							};
						},
					);

					await tx.billDetail.createMany({
						data: billDetailData,
					});
				}

				if (voucherUsageData.length > 0) {
					await tx.voucherUsage.createMany({
						data: voucherUsageData.map((v) => ({
							voucherId: v.voucherId,
							billId: bill.id,
						})),
					});
				}

				return {
					bill: {
						...bill,
						debit: billDebit,
						status: bill.status
					},
				};
			});
		} catch (err) {
			console.log('Create Bill Error:', err);
			throw err;
		}
	}
	async getBillByCode(code: string) {
		try {
			const bill = await this.prismaService.bill.findFirst({
				where: { code },
				select: {
					id: true,
					code: true,
					cost: true,
					debit: true,
					status: true,

					customer: {
						select: { id: true, name: true },
					},
				},
			});
			if (!bill) return bill;
			return {
				...bill,
				customer: {
					id: bill.customer.id,
					name: bill.customer.name ?? 'Chưa có thông tin',
				},
				status: bill.status,
				debit: Number(bill.debit ?? 0),
			};
		} catch (err) {
			console.log('get bill by code error', err);
			throw err;
		}
	}
	async getBillById(id: number) {
		try {
			const bill = await this.prismaService.bill.findFirst({
				where: { id },
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,

					customer: {
						select: { id: true, name: true },
					},
				},
			});
			if (!bill) return bill;
			return {
				...bill,
				customer: {
					id: bill.customer.id,
					name: bill.customer.name ?? 'Chưa có thông tin',
				},
				status: mapEnumToVietnamese(
					bill.status,
					ENUM_VI_MAP.billStatus,
				),
			};
		} catch (err) {
			console.log('get bill by code error', err);
			throw err;
		}
	}
	//Update Bill
	async updateBill(id: number, updateBillData: UpdateBillData) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				// update bill basic info
				let customer = null;
				if (updateBillData.customerPhone) {
					customer = await tx.customer.findUnique({
						where: { phone: updateBillData.customerPhone },
						select: { id: true, phone: true },
					});
					if (!customer) {
						const createdGuest =
							await this.customerService.createStrangeCustomer(
								updateBillData.customerPhone,
							);
						customer = {
							id: createdGuest.id,
							phone: createdGuest.phone,
						};
					}
				}

				const bill = await tx.bill.update({
					where: { id },
					data: {
						customerId: customer ? customer.id : undefined,
						status: updateBillData.status,
						cost: updateBillData.cost,
					},
				});

				// delete old details
				await tx.billDetail.deleteMany({
					where: { billId: id },
				});

				await tx.voucherUsage.deleteMany({
					where: { billId: id },
				});

				if (updateBillData.billDetails) {
					const bookCodes = updateBillData.billDetails.map(
						(b) => b.bookCode,
					);
					const books = await tx.book.findMany({
						where: { code: { in: bookCodes } },
					});
					const bookMap = new Map(books.map((b) => [b.code, b]));

					const billDetailData = updateBillData.billDetails.map(
						(b) => {
							const book = bookMap.get(b.bookCode);
							if (!book)
								throw new BadRequestException(
									`Không tìm thấy sách có mã ${b.bookCode}`,
								);
							return {
								bookId: book.id,
								quantity: b.quantity,
								billId: id,
							};
						},
					);

					await tx.billDetail.createMany({
						data: billDetailData,
					});
				}

				// create new voucherUsage
				if (updateBillData.vouchers) {
					const voucherUsageData = updateBillData.vouchers.map(
						(v) => ({
							voucherId: v.voucherId,
							billId: id,
						}),
					);

					await tx.voucherUsage.createMany({
						data: voucherUsageData,
					});
				}

				return bill;
			});
		} catch (err) {
			console.log('Update Bill Error:', err);
			throw err;
		}
	}
}
