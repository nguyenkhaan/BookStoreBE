import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

@Controller('voucher')
export class VoucherController {
	@Get()
	async getAllVouchers() {}
	@Post()
	async createVoucher() {}

	@Get('/:voucherId')
	async getVoucherById(@Param('voucherId', ParseIntPipe) voucherId: number) {
		return voucherId;
	}
}
