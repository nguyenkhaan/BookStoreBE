import { Roles } from '@/bases/decorators/role.decorators';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { IncomePaymentType, IncomeStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { IncomeService } from './income.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import type { Request } from 'express';
import {
	ENUM_VI_MAP,
	mapEnumOptionsToVietnamese,
} from '@/utlitis/enumLocalization';
@Controller('income')
export class IncomeController {
	constructor(private readonly incomeService: IncomeService) {}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	async getAllIncomes() {
		const response = await this.incomeService.getAllIncome();
		return response;
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('options')
	async getIncomeOption() {
		const status = mapEnumOptionsToVietnamese(
			Object.values(IncomeStatus),
			ENUM_VI_MAP.incomeStatus,
		);
		const paymentMethods = mapEnumOptionsToVietnamese(
			Object.values(IncomePaymentType),
			ENUM_VI_MAP.incomePaymentType,
		);
		return {
			status,
			paymentMethods,
		};
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('statistic')
	async getIncomeGeneralStatistic() {
		return await this.incomeService.getGeneralStatistic();
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/:id')
	async getIncomeById(@Param('id') id: number) {
		return this.incomeService.getIncomeById(Number(id));
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/code/:code')
	async getIncomeByCode(@Param('code') code: string) {
		return this.incomeService.getIncomeByCode(code);
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async createIncome(@Body() dto: CreateIncomeDto, @Req() req: Request) {
		const employeeId = (req.user as any).id;
		if (employeeId) {
			return this.incomeService.createIncome(Number(employeeId), dto);
		} else throw new BadRequestException('Không tìm thấy nhân viên');
	}

	@Put('/:id')
	async updateIncome(@Param('id') id: number, @Body() dto: UpdateIncomeDto) {
		return this.incomeService.updateIncome(Number(id), dto);
	}

	@Delete('/:id')
	async deleteIncome(@Param('id') id: number) {
		return this.incomeService.deleteIncome(Number(id));
	}
}
//Lay thong tin tat ca income
