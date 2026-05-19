import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { SettingService } from './settings.service';
import { UpdateSettingDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';

@Controller('settings') 
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard , RolesGuard)
export class SettingController {
	constructor(private readonly settingService: SettingService) {}

	@Get()
	async getSettings() {
		return this.settingService.getAllSettings();
	}

	@Patch()
	async updateSettings(@Body() body: UpdateSettingDto[]) {
		return this.settingService.updateSettings(body);
	}
}
