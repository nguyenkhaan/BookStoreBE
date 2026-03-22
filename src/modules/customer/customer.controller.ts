import { Roles } from "@/bases/decorators/role.decorators";
import { Controller, UseGuards } from "@nestjs/common";
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

}