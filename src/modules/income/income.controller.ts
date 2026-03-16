import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { IncomeService } from './income.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import type { Request } from 'express';
@Controller('income')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncomeController {
	constructor(private readonly incomeService: IncomeService) {}
	@Get('/:id')
	async getIncomeById(@Param('id') id: number) {
		return this.incomeService.getIncomeById(Number(id));
	}

	@Get('/code/:code')
	async getIncomeByCode(@Param('code') code: string) {
		return this.incomeService.getIncomeByCode(code);
	}

	@Post()
	async createIncome(@Body() dto: CreateIncomeDto, @Req() req: Request) {
		const employeeId = req.user as any;
		if (employeeId) {
			return this.incomeService.createIncome(Number(employeeId), dto);
		} else throw new UnauthorizedException('Employee Unauthorized');
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
