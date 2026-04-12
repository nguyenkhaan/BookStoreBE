import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { CustomerService } from './customer.service';
import { CreateCustomerData, UpdateCustomerData } from './dto/customer.dto';

@Controller('customer')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    @Get()
    async getAllCustomers() {
        return this.customerService.getAllCustomers();
    }

    @Get('/statistic')
    async getStatistic() {
        return this.customerService.getStatistic();
    }

    @Get('/phone')
    async getCustomerByPhone(@Query('phone') phone: string) {
        return this.customerService.getCustomerByPhone(phone);
    }

    @Get('/:id')
    async getCustomerById(@Param('id', ParseIntPipe) id: number) {
        return this.customerService.getCustomerById(id);
    }

    @Post()
    async createCustomer(@Body() data: CreateCustomerData) {
        return this.customerService.createCustomer(data);
    }

    @Put('/:id')
    async updateCustomer(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateCustomerData,
    ) {
        return this.customerService.updateCustomer(id, data);
    }

    @Delete('/:id')
    async deleteCustomer(@Param('id', ParseIntPipe) id: number) {
        return this.customerService.deleteCustomer(id);
    }
}
