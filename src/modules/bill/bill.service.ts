import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { VoucherType } from '@prisma/client';
import { CreateBillData, UpdateBillData } from './dto/bill.dto';
import { VoucherService } from '../voucher/voucher.service';

@Injectable()
export class BillService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly voucherService: VoucherService,
	) {}
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
			console.log(bills) 
			const result = bills.map((bill) => {
				let total = bill.billDetail.reduce((sum, item) => {
					return sum + item.quantity * Number(item.book.cost);
				}, 0);

				for (const v of bill.voucherUsage) {
					const voucher = v.voucher;
					const isUse =
						this.voucherService.checkVoucherInUse(voucher);
					if (!isUse) continue;
					if (voucher.type == VoucherType.PERCENT)
						total = Math.max(
							0,
							total - (total * Number(voucher.sale)) / 100,
						);
					else total = Math.max(0, total - Number(voucher.sale));
				}
				return {
					...bill,
					totalCost: total,
				};
			});
			console.log(result) 
			return result;
		} catch (err) {
			console.log('Get All Bills Error: ', err);
			throw err;
		}
	}
	async createBill(createBillData: CreateBillData) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const bill = await tx.bill.create({
					data: {
						code: createBillData.code,
						customerId: createBillData.customerId,
						temporaryCost: createBillData.temporaryCost || 0,
						status: createBillData.status,
					},
				});
								//Giam so luong voucher xuong
				if (createBillData.vouchers) {
					for (const v of createBillData.vouchers) {
						const success = await this.voucherService.decreaseVoucher(
							v.voucherId, tx 
						);
						if (!success)
							throw new Error('Voucher không hợp lệ hoặc đã hết');
					}
				}

				const voucherUsageData = [];
				const billDetailData = [];
				//Create voucher usage 
				if (createBillData.vouchers) {
					for (const v of createBillData.vouchers) {
						voucherUsageData.push({
							billId: bill.id,
							voucherId: v.voucherId,
						});
					}
					await tx.voucherUsage.createMany({
						data: voucherUsageData,
					});
				}
				//Create bill data 
				if (createBillData.billDetails) {
					for (const b of createBillData.billDetails) {
						billDetailData.push({
							quantity: b.quantity,
							bookId: b.bookId,
							billId: bill.id,
						});
					}
					await tx.billDetail.createMany({
						data: billDetailData,
					});
				}

				return {
					bill,
					voucherUsage: voucherUsageData,
					billDetail: billDetailData,
				};
			})
		} catch (err) {
			(console.log('Create Bill Error'), err);
			throw err;
		}
	}
	//Update Bill
	async updateBill(id: number, updateBillData: UpdateBillData) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				// update bill basic info
				const bill = await tx.bill.update({
					where: { id },
					data: {
						code: updateBillData.code,
						customerId: updateBillData.customerId,
						temporaryCost: updateBillData.temporaryCost,
						status: updateBillData.status,
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
					const billDetailData = updateBillData.billDetails.map(
						(b) => ({
							bookId: b.bookId,
							quantity: b.quantity,
							billId: id,
						}),
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
