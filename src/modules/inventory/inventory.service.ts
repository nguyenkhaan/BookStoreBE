import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SettingService } from '../settings/settings.service';

@Injectable()
export class InventoryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly settingService: SettingService,
	) {}

	canImportToStock(
		currentStock: number,
		addNum: number,
		maxStock: number,
	): boolean {
		return currentStock < 300 && currentStock + addNum <= maxStock;
	}

	async canImportBookByCode(code: string, addNum: number) {
		const inventory = await this.prismaService.inventory.findFirst({
			where: { book: { code, deletedAt: null } },
		});
		const currentStock = inventory?.stock ?? 0;
		const maxStock = await this.settingService.getSettingValue('STOCK_MAX');
		return this.canImportToStock(currentStock, addNum, maxStock);
	}

	async canImportBookInTransaction(
		tx: Prisma.TransactionClient,
		bookId: number,
		addNum: number,
		maxStock: number,
	): Promise<boolean> {
		const inventory = await tx.inventory.findUnique({
			where: { bookId },
		});
		const currentStock = inventory?.stock ?? 0;
		return this.canImportToStock(currentStock, addNum, maxStock);
	}
	async canSellBookByCode(code: string, sellNum: number) {
		const inventory = await this.prismaService.inventory.findFirst({
			where: { book: { code } },
		});
		if (!inventory) return false;
		//Yeu cau: Khong duoc ban sach neu nhu so sach con lai it hon yeu cau toi thieu
		if (inventory.stock - sellNum >= (await this.settingService.getSettingValue('STOCK_MIN'))) return true;
		return false; //Khong duoc ban sach
	}
}
