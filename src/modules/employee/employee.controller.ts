import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import type { Request } from 'express';
@Controller('employee')
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
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	async getAllEmployeeProfiles() {
		const responseData = await this.employeeService.getAllEmployee();
		return responseData;
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
}
