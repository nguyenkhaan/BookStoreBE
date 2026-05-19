import { Controller, Get, Body, Patch } from '@nestjs/common';
import { SettingService } from './settings.service';
import { UpdateSettingDto } from './dto/settings.dto';

@Controller('settings')
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
