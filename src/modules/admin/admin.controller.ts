import { RolesGuard } from '@/bases/guards/role.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/bases/decorators/role.decorators'; //Roles = annotation
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterData, UpdateEmployeeData } from './dto/admin.dto';
import { AdminService } from './admin.service';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
@Controller('/admin')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}
	@Get('testing')
	async testing() {
		return 'Admin endpoint successfully';
	}
	@UseInterceptors(FileInterceptor('avatar'))
	@Post('/employee/register')
	async register(
		@Body() data: RegisterData,
		@UploadedFile() file: Express.Multer.File,
	) {
		const responseData = await this.adminService.register(data, file);
		return responseData;
	}
	@Patch('/employee/reset-password')
	async resetPasswordToDefault(@Req() req: Request) {
		const { id } = req.body;
		const responseData = await this.adminService.resetPasswordToDefault(id);
		return responseData;
	}
	@UseInterceptors(FileInterceptor('avatar'))
	@Put('/employee/:employeeId')
	async updateEmployeeInformation(
		@Param('employeeId', ParseIntPipe) employeeId: number,
		@Body() updateEmployeeData: UpdateEmployeeData,
		@UploadedFile() file: Express.Multer.File,
	) {
		const responseData = await this.adminService.updateEmployeeInformation(
			employeeId,
			file,
			updateEmployeeData,
		);
		return responseData;
	}
	@Delete('employee/:employeeId')
	async deleteEmployeeAccount(
		@Param('employeeId', ParseIntPipe) employeeId: number,
	) {
		const responseData = await this.adminService.deleteEmployeeAccount(
			Number(employeeId),
		);
		return responseData;
	}
}
