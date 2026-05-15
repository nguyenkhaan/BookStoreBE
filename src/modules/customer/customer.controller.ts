import { Roles } from '@/bases/decorators/role.decorators';
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
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Controller('customer')
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	async getAllCustomers() {
		return await this.customerService.getCustomersWithTotalPaid();
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async createCustomerAccount(@Body() data: CreateCustomerDto) {
		const response = await this.customerService.createCustomer(data);
		return response;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async getCustomerById() {}
	@Delete('/:customerId')
	async deleteCustomer(
		@Param('customerId', ParseIntPipe) customerId: number,
	) {
		const response =
			await this.customerService.deleteCustomerById(customerId);
		return response;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('statistic')
	async getGeneralStatistic() {
		return await this.customerService.getGeneralStatistic();
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('phone')
	async getCustomerByPhoneNumber(@Query('phone') phone: string) {
		//Thuc hien viec tim kiem
		return await this.customerService.getCustomerByPhone(phone);
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
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
