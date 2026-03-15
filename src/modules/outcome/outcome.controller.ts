import { Roles } from '@/bases/decorators/role.decorators';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { OutcomeService } from './outcome.service';
import type { Request } from 'express';
import { CreateOutcomeData, UpdateOutcomeData } from './dto/outcome.dto';
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
            console.log(employeeId) 
            const responseData = await this.outcomeService.createOutcomeBill(employeeId , createOutcomeData) 
            return responseData
        } 
        else throw new UnauthorizedException("Employee Unauthorized")
    }
    @Put("/:outcomeId")
    async updateOutcomeBill(
            @Param('outcomeId', ParseIntPipe) outcomeId: number,
            @Body() updateOutcomeData : UpdateOutcomeData
    ) {
            const responseData = await this.outcomeService.updateOutcomeBill(
                outcomeId,
                updateOutcomeData,
            );
            return responseData;
    }
    @Delete("/:outcomeId")
    async deleteOutcomeBill(
            @Param('outcomeId', ParseIntPipe) outcomeId: number,
    ) {
            const responseData = await this.outcomeService.deleteOutcomeBill(outcomeId);
            return responseData;
    }
}
