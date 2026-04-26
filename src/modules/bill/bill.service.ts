import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BillStatus, VoucherStatus, VoucherType } from '@prisma/client';
import { CreateBillData, UpdateBillData } from './dto/bill.dto';
import { DEBIT_MAX } from '@/bases/commons/constants/app.constant';
import { InventoryService } from '../inventory/inventory.service';
// import { VoucherService } from '../voucher/voucher.service';
@Injectable()
export class BillService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly inventoryService: InventoryService,
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
					
					voucherUsage : bill.voucherUsage.map((usage) => {
						return {usedAt : usage.usedAt , ...usage.voucher , sale : Number(usage.voucher.sale) }
					}),
					billDetail : bill.billDetail.map((detail) => {
						return {
							...detail.book, 
							quantity : detail.quantity
						}
					})
				}
			})
			return resultBills;
		} catch (err) {
			console.log('Get All Bills Error: ', err);
			throw err;
		}
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
			return await this.prismaService.$transaction(async (tx) => {
				const bookCodes = createBillData.billDetails.map((b) => b.bookCode);

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

					if (!book) throw new BadRequestException('Book not found');

					const canSellBook =
						await this.inventoryService.canSellBookByCode(
							book.code,
							item.quantity,
						);
					if (canSellBook == false)
						throw new BadRequestException(
							'Cannot Sell books because restrict book stock minium remain',
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
							"Don't have enough books",
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
							throw new BadRequestException('Voucher invalid');

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
				const customer = await this.prismaService.customer.findFirst({
					where: { phone: createBillData.customerPhone },
					select: { id: true, code: true },
				});
				if (!customer)
					throw new BadRequestException(
						'Customer Phone does not exists',
					);
				//Tinh no cua mot khach hang

				const _totalBillCost = await tx.bill.aggregate({
					_sum: { cost: true },
					where: {
						customerId: customer.id,
					},
				});
				const _totalPaid = await tx.billIncome.aggregate({
					_sum: { cost: true },
					where: {
						bill: { customerId: customer.id },
					},
				});

				if (
					Number(_totalBillCost._sum.cost ?? 0) -
						Number(_totalPaid._sum.cost ?? 0) >
					DEBIT_MAX
				)
					throw new BadRequestException(
						"Customer has the debit exceed charge. Can't sell",
					);
				console.log("Tong gia tien: " , totalCost) 
				console.log(createBillData.temporaryCost)
				const bill = await tx.bill.create({
					data: {
						code: createBillData.code,
						customerId: customer.id,
						status: createBillData.status,
						cost: Math.max(
							0,
							// totalCost - (createBillData.temporaryCost || 0),
							createBillData.temporaryCost || 0 
						),
					},
				});
				
				if (createBillData.billDetails) {
					const billDetailData = createBillData.billDetails.map(
						(b) => {
							const book = bookMap.get(b.bookCode);
							if (!book) throw new BadRequestException(`Book with code ${b.bookCode} not found`);
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
					bill,
				};
			});
		} catch (err) {
			console.log('Create Bill Error:', err);
			throw err;
		}
	}
	//Update Bill
	async updateBill(id: number, updateBillData: UpdateBillData) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				// update bill basic info
				const customer = await tx.customer.findFirst({
					where: { phone: updateBillData.customerPhone },
					select: { id: true, phone: true },
				});

				if (!customer)
					throw new BadRequestException('Customer not found');

				const bill = await tx.bill.update({
					where: { id },
					data: {
						code: updateBillData.code,
						customerId: customer.id,
						status: updateBillData.status,
						cost : updateBillData.cost 
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
					const bookCodes = updateBillData.billDetails.map((b) => b.bookCode);
					const books = await tx.book.findMany({
						where: { code: { in: bookCodes } },
					});
					const bookMap = new Map(books.map((b) => [b.code, b]));

					const billDetailData = updateBillData.billDetails.map(
						(b) => {
							const book = bookMap.get(b.bookCode);
							if (!book) throw new BadRequestException(`Book with code ${b.bookCode} not found`);
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
