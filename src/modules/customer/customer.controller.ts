import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/customer.dto';

@Controller('customer')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}
	@Get()
	async getAllCustomers() {
		return await this.customerService.getCustomersWithTotalPaid();
	}

	async getCustomerById() {}
	@Delete('/:customerId')
	async deleteCustomer(
		@Param('customerId', ParseIntPipe) customerId: number,
	) {
		const response =
			await this.customerService.deleteCustomerById(customerId);
		return response;
	}
	@Get('statistic')
	async getGeneralStatistic() {
		return await this.customerService.getGeneralStatistic();
	}
	@Get('phone')
	async getCustomerByPhoneNumber(@Query('phone') phone: string) {
		//Thuc hien viec tim kiem
		return await this.customerService.getCustomerByPhone(phone);
	}
	@Put('/:customerId')
	async updateCustomer(
		@Param('customerId', ParseIntPipe) customerId: number,
		@Body() data: UpdateCustomerDto,
	) {
		const response = await this.customerService.updateCustomerById(
			Number(customerId),
			data,
		);
		return response;
	}
}
