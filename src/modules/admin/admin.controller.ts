import { RolesGuard } from '@/bases/guards/role.guard';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/bases/decorators/role.decorators'; //Roles = annotation
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterData, UpdateEmployeeData } from './dto/admin.dto';
import { AdminService } from './admin.service';
import type { Request } from 'express';
@Controller('/admin')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}
	@Get('testing')
	async testing() {
		return 'Admin endpoint successfully';
	}
	@Post('register')
	async register(@Body() data: RegisterData) {
		const responseData = await this.adminService.register(data);
		return responseData;
	}
	@Patch('reset-password-employee')
	async resetPasswordToDefault(@Req() req: Request) {
		const { id } = req.body;
		const responseData = await this.adminService.resetPasswordToDefault(id);
		return responseData;
	}
	@Put("/update-employee/:employeeId") 
	async updateEmployeeInformation(@Param("employeeId" , ParseIntPipe) employeeId : number , @Body() updateEmployeeData : UpdateEmployeeData) {
		const responseData = await this.adminService.updateEmployeeInformation(employeeId , updateEmployeeData) 
		return responseData 
	}
}
