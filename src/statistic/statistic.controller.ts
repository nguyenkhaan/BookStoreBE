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
	@Get('/recent-orders')
	async getRecentOrders(@Query('limit', ParseIntPipe) limit: number) {
		return this.statisticService.getRecentOrders(limit);
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('revenue')
	async revenueGeneral() {
		//Lay doanh thu tong quat
		return await this.statisticService.getGeneralRevenue();
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('revenue/month/:month') //Doanh thu
	async revenueInMonths(@Param('month', ParseIntPipe) month: number) {
		return await this.statisticService.getRevenueInRecentMonths(
			Number(month),
		);
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
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
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('inventory') //Ton khi
	async getInventoryBook() {
		return await this.statisticService.getInventoryByCategory();
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('customers')
	async getGradeCustomers() {
		return await this.statisticService.getCustomerByGrade();
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('revenue/chart')
	async getRevenueChart(@Query() query: RevenueChartQueryDto) {
		return await this.statisticService.getRevenueChart(query);
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('customer/debit')
	async getCustomerDebit() {
		return await this.statisticService.getCustomerDebit();
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/:month')
	async statisticGeneral(@Param('month', ParseIntPipe) month: number) {
		console.log(month);
		//Thong ke tat ca thong tin theo 1 thang cu the
	}
}
