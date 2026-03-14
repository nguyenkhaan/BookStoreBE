import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';

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
}
