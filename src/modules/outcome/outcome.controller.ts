import { Roles } from '@/bases/decorators/role.decorators';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { OutcomeStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { OutcomeService } from './outcome.service';
import type { Request } from 'express';
import { CreateOutcomeData, UpdateOutcomeData } from './dto/outcome.dto';
import {
	ENUM_VI_MAP,
	mapEnumOptionsToVietnamese,
} from '@/utlitis/enumLocalization';
@Controller('outcome')
//Danh sach phieu nhap (Nhap hang)
export class OutcomeController {
	constructor(private readonly outcomeService: OutcomeService) {}
	@Get()
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async getAllOutcomeBills() {
		const responseData = await this.outcomeService.getAllOutcome();
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('statistic')
	async getGeneralStatistic() {
		return this.outcomeService.getGeneralStatistic();
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('options')
	async getOutcomeOptions() {
		const status = mapEnumOptionsToVietnamese(
			Object.values(OutcomeStatus),
			ENUM_VI_MAP.outcomeStatus,
		);
		return {
			status,
		};
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/code/:code')
	async getOutcomeByCode(@Param('code') code: string) {
		const responseData = await this.outcomeService.getOutcomeByCode(code);
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/:outcomeId')
	async getOutcomeById(@Param('outcomeId', ParseIntPipe) outcomeId: number) {
		const responseData =
			await this.outcomeService.getOutcomeById(outcomeId);
		return responseData;
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async createOutcomeBill(
		@Req() req: Request,
		@Body() createOutcomeData: CreateOutcomeData,
	) {
		const user = req.user as any;
		const employeeId = user.id;
		if (employeeId) {
			const responseData = await this.outcomeService.createOutcomeBill(
				employeeId,
				createOutcomeData,
			);
			return responseData;
		} else throw new BadRequestException('Không tìm thấy nhân viên');
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Put('/:outcomeId')
	async updateOutcomeBill(
		@Param('outcomeId', ParseIntPipe) outcomeId: number,
		@Body() updateOutcomeData: UpdateOutcomeData,
	) {
		const responseData = await this.outcomeService.updateOutcomeBill(
			outcomeId,
			updateOutcomeData,
		);
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('/:outcomeId')
	async deleteOutcomeBill(
		@Param('outcomeId', ParseIntPipe) outcomeId: number,
	) {
		const responseData =
			await this.outcomeService.deleteOutcomeBill(outcomeId);
		return responseData;
	}
}
