import { RolesGuard } from '@/bases/guards/role.guard';
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
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/bases/decorators/role.decorators'; //Roles = annotation
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterData, UpdateEmployeeData } from './dto/admin.dto';
import { AdminService } from './admin.service';
// import type { Request } from 'express';
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
	//Lám them chuc nang giup reset lai mat khau va gui lai mat kahu ve email cho khach hang
	@Post()
	async resetCustomerAccount(@Query('phone') phone: string) {
		console.log(phone);
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
	//Bo ham nay
	// @Patch('/employee/reset-password')
	// async resetPasswordToDefault(@Req() req: Request) {
	// 	const { id } = req.body;
	// 	const responseData = await this.adminService.resetPasswordToDefault(id);
	// 	return responseData;
	// }

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
	@Post('/employee/reset-password/:employeeId')
	async resetEmployeePassword(@Param('employeeId', ParseIntPipe) employeeId: number) {
		return await this.adminService.resetEmployeePassword(Number(employeeId));
	}
	@Post('/customer/reset-password/:customerId')
	async resetCustomerPassword(@Param('customerId', ParseIntPipe) customerId: number) {
		return await this.adminService.resetCustomerPassword(Number(customerId));
	}
}
