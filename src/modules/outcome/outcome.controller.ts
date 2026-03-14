import { Roles } from '@/bases/decorators/role.decorators';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { OutcomeService } from './outcome.service';
import type { Request } from 'express';
import { CreateOutcomeData } from './dto/outcome.dto';
@Controller('outcome')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard) //Danh sach phieu nhap (Nhap hang)
export class OutcomeController {
    constructor(
        private readonly outcomeService : OutcomeService
    ) {} 
    @Get() 
    async getAllOutcomeBills() 
    {
        const responseData = await this.outcomeService.getAllOutcome() 
        return responseData
    } 
    @Get("/:outcomeId") 
    async getOutcomeById(@Param("outcomeId" , ParseIntPipe) outcomeId : number) 
    {
        const responseData = await this.outcomeService.getOutcomeById(outcomeId) 
        return responseData
    } 
    @Get("/code/:code")
    async getOutcomeByCode(@Param("code") code : string) 
    {
        const responseData = await this.outcomeService.getOutcomeByCode(code) 
        return responseData
    }
    @Post() 
    async createOutcomeBill(@Req() req : Request , @Body() createOutcomeData : CreateOutcomeData) 
    {
        const user = req.user as any 
        const employeeId = user.id 
        if (employeeId) 
        {
            console.log(createOutcomeData)
        } 
        throw new UnauthorizedException("Employee Unauthorized")
    }
}
