import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Get,
	Delete,
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
import {
	ENUM_VI_MAP,
	mapEnumOptionsToVietnamese,
} from '@/utlitis/enumLocalization';

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
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('code/:codex')
	async getBillByCode(@Param('codex') codex: string) {
		const response = await this.billService.getBillByCode(codex);
		return response;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/:billId')
	async getBillByID(@Param('billId') billId: number) {
		const response = await this.billService.getBillById(Number(billId));
		return response;
	}
	@Get('option')
	async getBillOptions() {
		const status = mapEnumOptionsToVietnamese(
			Object.values(BillStatus),
			ENUM_VI_MAP.billStatus,
		);
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
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('/:billId')
	async deleteBill(@Param('billId', ParseIntPipe) billId: number) {
		const responseData = await this.billService.deleteBill(billId);
		return responseData;
	}
}
