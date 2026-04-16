import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherData, UpdateVoucherData } from './dto/voucher.dto';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';

@Controller('voucher')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoucherController {
	constructor(private readonly voucherService: VoucherService) {}
	@Get()
	async getAllVouchers() {
		const responseData = await this.voucherService.getAllVouchers();
		return responseData;
	}
	@Get('use')
	async getAllVoucherInUse() {
		const responseData = await this.voucherService.getVoucherCanUse();
		return responseData;
	}
	@Get('options')
	async getVoucherOptions() {
		return this.voucherService.getVoucherOptions();
	}
	@Post()
	async createVoucher(@Body() createVoucherData: CreateVoucherData) {
		const responseData =
			await this.voucherService.createVoucher(createVoucherData);
		return responseData;
	}

	@Get('/:voucherId')
	async getVoucherById(@Param('voucherId', ParseIntPipe) voucherId: number) {
		const responseData = await this.voucherService.getVoucherById(
			Number(voucherId),
		);
		return responseData;
	}
	@Put('/:voucherId')
	async updateVoucherById(
		@Param('voucherId', ParseIntPipe) voucherId: number,
		@Body() updateVoucherData: UpdateVoucherData,
	) {
		const responseData = await this.voucherService.updateVoucher(
			voucherId,
			updateVoucherData,
		);
		return responseData;
	}
	@Delete('/:voucherId')
	async deleteVoucherById(
		@Param('voucherId', ParseIntPipe) voucherId: number,
	) {
		const responseData = await this.voucherService.deleteVoucher(voucherId);
		return responseData;
	}
	@Get('statistic')
	async getVoucherGeneralStatistic() {
		return await this.voucherService.getVoucherGeneralStatistic();
	}
}
