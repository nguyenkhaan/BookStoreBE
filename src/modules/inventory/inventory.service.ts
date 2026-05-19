import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SettingService } from '../settings/settings.service';

@Injectable()
export class InventoryService {
	//Co the nhap sach hay khong
	constructor(private readonly prismaService: PrismaService, 

		private readonly settingService : SettingService

	) {}
	async canImportBookByCode(code: string, addNum: number) {
		const inventory = await this.prismaService.inventory.findFirst({
			where: { book: { code } },
		});
		if (!inventory) return false;
		if (inventory.stock < 300 && inventory.stock + addNum <= (await this.settingService.getSettingValue('STOCK_MAX')))
			//So luong sach trong kho khong duoc vuot qua 300 - 500
			return true;
		return false;
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
