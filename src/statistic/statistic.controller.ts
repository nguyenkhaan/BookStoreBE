import { Roles } from '@/bases/decorators/role.decorators';
import { RolesGuard } from '@/bases/guards/role.guard';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { StatisticService } from './statistic.service';

@Controller('statistic')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticController {
    constructor(
        private readonly statisticService : StatisticService
    ) {} 
	@Get('revenue')
	async revenueGeneral() {
		//Lay doanh thu tong quat
        return await this.statisticService.getGeneralRevenue()
	}
	@Get('revenue/month/:month') //Doanh thu
	async revenueInMonths(@Param('month', ParseIntPipe) month: number) {
        return await this.statisticService.getRevenueInRecentMonths(Number(month)) 
    }
    @Get('revenue/bill/:month')
    async totalBillsInMonths(@Param("month" , ParseIntPipe) month : number) {
        return await this.statisticService.getCountBillInRecentMonths(Number(month))
    } 
    @Get('/top-books') 
    async getTopBook() 
    {
        return await this.statisticService.getTopHighBooks() 
    }
    @Get("inventory") //Ton khi 
    async getInventoryBook() 
    {
        return await this.statisticService.getInventoryByCategory() 
    } 
    @Get("customers") 
    async getGradeCustomers() 
    {
        return await this.statisticService.getCustomerByGrade() 
    }
    @Get("/:month") 
    async statisticGeneral(@Param("month" , ParseIntPipe) month : number) 
    {
        console.log(month) 
        //Thong ke tat ca thong tin theo 1 thang cu the 
    }
}
