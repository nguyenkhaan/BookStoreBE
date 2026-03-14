import { Roles } from "@/bases/decorators/role.decorators";
import { Body, Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "@/bases/guards/role.guard";
import { CreateBillData } from "./dto/bill.dto";
import { BillService } from "./bill.service";

@Controller("bill") 
@Roles(Role.EMPLOYEE) 
@UseGuards(JwtAuthGuard , RolesGuard)
export class BillController 
{
    constructor(
        private readonly billService : BillService
    ) {} 
    @Get() 
    async getAllBills() 
    {
        const responseData = await this.billService.getAllBills() 
        return responseData
    } 
    //Bo sung them mot so ham -> Lay thong tin bill bang code va id 
    @Post() 
    async createBill(@Body() createBillData : CreateBillData) 
    {
        const responseData = await this.billService.createBill(createBillData) 
        return responseData 
    } 
    @Put() 
    async updateBill() 
    {

    } 
    

} 