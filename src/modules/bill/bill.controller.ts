import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { BillStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { CreateBillData, UpdateBillData } from './dto/bill.dto';
import { BillService } from './bill.service';

@Controller('bill')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillController {
	constructor(private readonly billService: BillService) {}
	@Get()
	async getAllBills() {
		const responseData = await this.billService.getAllBills();
		return responseData;
	}
	@Get('statistic')
	async getGeneralStatistic() {
		return await this.billService.getGeneralStatistic();
	}
	@Get('option')
	async getBillOptions() {
		const status = Object.values(BillStatus);
		return {
			status,
		};
	}
	//Bo sung them mot so ham -> Lay thong tin bill bang code va id
	@Post()
	async createBill(@Body() createBillData: CreateBillData) {
		const responseData = await this.billService.createBill(createBillData);
		return responseData;
	}
	@Put('/:billId')
	async updateBill(
		@Param('billId', ParseIntPipe) billId: number,
		@Body() updateBillData: UpdateBillData,
	) {
		const responseData = await this.billService.updateBill(
			billId,
			updateBillData,
		);
		return responseData;
	}
	@Get('code')
	async getBillByCode() {}
}
