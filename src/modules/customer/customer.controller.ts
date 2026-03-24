import { Roles } from "@/bases/decorators/role.decorators";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "@/bases/guards/role.guard";
import { CustomerService } from "./customer.service";

@Controller("customer") 
@Roles(Role.EMPLOYEE) 
@UseGuards(JwtAuthGuard , RolesGuard)
export class CustomerController 
{
    constructor (
        private readonly customerService : CustomerService 
    ) {} 
    async getAllCustomer() 
    {
        return await this.customerService.getCustomersWithTotalPaid() 
    } 
    async getCustomerById() 
    {

    }
    async deleteCustomer() 
    {

    } 
    @Get("statistic") 
    async getGeneralStatistic() 
    {
        return await this.customerService.getGeneralStatistic() 
    }
    @Get("phone") 
    async getCustomerByPhoneNumber(
        @Query("phone") phone : string 
    ) //Thuc hien viec tim kiem 
    {
        return await this.customerService.getCustomerByPhone(phone) 
    }

}