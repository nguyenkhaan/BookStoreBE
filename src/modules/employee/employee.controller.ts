import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import type { Request } from 'express';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
@Controller('employee')
//http://localhost:4000/api
export class EmployeeController {
	constructor(private readonly employeeService: EmployeeService) {}
	@Get('verify')
	async verifyAccount(@Query('token') token: string) {
		const responseData =
			await this.employeeService.verifyEmployeeAccount(token);
		return responseData;
	}

	// @Patch("/reset-employee-password")
	//Lay tat ca nhan vien, Dat lai mat khau, chuc nang loc, tim kiem ???? Duma nhieu the
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	async getAllEmployeeProfiles() {
		const responseData = await this.employeeService.getAllEmployee();
		return responseData;
	}

	@Get('department-position')
	async getEmployeeDepartPosition() {
		const response = await this.employeeService.getDepartmentAndPositions();
		return response;
	}

	@Get('options')
	async getEmployeeOptions() {
		return await this.employeeService.getOptions();
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async createEmployeeAccount(@Body() employeeAccount: CreateEmployeeDto) {
		const response =
			await this.employeeService.createAccount(employeeAccount);
		return response;
	}

	@Put('/:employeeId')
	async updateEmployeeAccount(
		@Param('employeeId', ParseIntPipe) employeeId: number,
		@Body() employeeAccount: UpdateEmployeeDto,
	) {
		const response = await this.employeeService.updateEmployeeAccount(
			employeeId,
			employeeAccount,
		);
		return response;
	}

	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('profile')
	async getProfile(@Req() req: Request) {
		const user = req.user as any;
		const { id } = user;
		const responseData = await this.employeeService.getEmployeeProfile(
			Number(id),
		);
		return responseData;
	}

	@Get('code')
	async getEmployeeByCode(@Query('code') code: string) {
		return await this.employeeService.getEmployeeByCode(code);
	}

	@Get('statistic')
	async getEmployeeGeneralStatistic() {}

	@Delete('/:employeeId')
	async deleteEmployeeAccount(
		@Param('employeeId', ParseIntPipe) employeeId: number,
	) {
		const response = await this.employeeService.deleteAccount(
			Number(employeeId),
		);
		return response;
	}
}
