import { Roles } from '@/bases/decorators/role.decorators';
import { RolesGuard } from '@/bases/guards/role.guard';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import {
	Controller,
	DefaultValuePipe,
	Get,
	Param,
	ParseIntPipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { StatisticService } from './statistic.service';
import { RevenueChartQueryDto } from './dto/statistic.dto';

@Controller(['statistic', 'statistics'])
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}
	@Get('general') //Lay thong tin thong ke tong quan
	async getGeneralStatistic() {
		return await this.statisticService.getGeneralStatistic();
	}
	@Get('top-customer')
	async getTopCustomers(
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
	) {
		return await this.statisticService.getTopCustomers(limit);
	}
	@Get('revenue')
	async revenueGeneral() {
		//Lay doanh thu tong quat
		return await this.statisticService.getGeneralRevenue();
	}
	@Get('revenue/month/:month') //Doanh thu
	async revenueInMonths(@Param('month', ParseIntPipe) month: number) {
		return await this.statisticService.getRevenueInRecentMonths(
			Number(month),
		);
	}
	@Get('revenue/bill/:month')
	async totalBillsInMonths(@Param('month', ParseIntPipe) month: number) {
		return await this.statisticService.getCountBillInRecentMonths(
			Number(month),
		);
	}
	@Get('/top-books')
	async getTopBook() {
		return await this.statisticService.getTopHighBooks();
	}
	@Get('inventory') //Ton khi
	async getInventoryBook() {
		return await this.statisticService.getInventoryByCategory();
	}
	@Get('customers')
	async getGradeCustomers() {
		return await this.statisticService.getCustomerByGrade();
	}

	@Get('revenue/chart')
	async getRevenueChart(@Query() query: RevenueChartQueryDto) {
		return await this.statisticService.getRevenueChart(query);
	}
	@Get('customer/debit')
	async getCustomerDebit() {
		return await this.statisticService.getCustomerDebit();
	}
	@Get('/:month')
	async statisticGeneral(@Param('month', ParseIntPipe) month: number) {
		console.log(month);
		//Thong ke tat ca thong tin theo 1 thang cu the
	}
}
