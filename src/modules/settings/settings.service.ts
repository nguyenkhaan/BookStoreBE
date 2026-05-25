import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateSettingDto } from './dto/settings.dto';

@Injectable()
export class SettingService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllSettings() {
		return this.prisma.systemSetting.findMany({
			orderBy:  {id : 'asc'}
		});
	}

	async updateSettings(settings: UpdateSettingDto[]) {
		const updatePromises = settings.map((item) =>
			this.prisma.systemSetting.update({
				where: { key: item.key },
				data: {
					value: item.value,
					description: item.description ?? '',
				},
			}),
		);
		await Promise.all(updatePromises);
		return { message: 'Cập nhật cấu hình hệ thống thành công!' };
	}

	async getSettingValue(key: string): Promise<number> {
		const setting = await this.prisma.systemSetting.findUnique({
			where: { key },
		});
		return setting ? Number(setting.value) : 0;
	}
}
