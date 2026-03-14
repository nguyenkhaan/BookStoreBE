import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { VoucherStatus, VoucherType } from '@prisma/client';
import { CreateBillData, UpdateBillData } from './dto/bill.dto';
// import { VoucherService } from '../voucher/voucher.service';

@Injectable()
export class BillService {
	constructor(
		private readonly prismaService: PrismaService,
		// private readonly voucherService: VoucherService,
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
			return bills;
		} catch (err) {
			console.log('Get All Bills Error: ', err);
			throw err;
		}
	}
	async createBill(createBillData: CreateBillData) {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const bookIds = createBillData.billDetails.map((b) => b.bookId);

				const books = await tx.book.findMany({
					where: { id: { in: bookIds } },
				});

				const bookMap = new Map(books.map((b) => [b.id, b]));

				let totalCost = 0;

				for (const item of createBillData.billDetails) {
					const book = bookMap.get(item.bookId);

					if (!book) throw new BadRequestException('Book not found');

					totalCost += item.quantity * Number(book.cost);
				}

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

				const bill = await tx.bill.create({
					data: {
						code: createBillData.code,
						customerId: createBillData.customerId,
						status: createBillData.status,
						cost: Math.max(
							0,
							totalCost - (createBillData.temporaryCost || 0),
						),
					},
				});

				if (createBillData.billDetails) {
					const billDetailData = createBillData.billDetails.map(
						(b) => ({
							bookId: b.bookId,
							quantity: b.quantity,
							billId: bill.id,
						}),
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
				const bill = await tx.bill.update({
					where: { id },
					data: {
						code: updateBillData.code,
						customerId: updateBillData.customerId,
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
