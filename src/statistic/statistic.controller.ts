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
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get('general')
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

	@Get('revenue')
	async revenueGeneral() {
		return await this.statisticService.getGeneralRevenue();
	}

	@Get('revenue/month/:month')
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

	@Get('inventory')
	async getInventoryBook() {
		return await this.statisticService.getInventoryByCategory();
	}

	@Get('inventory-flow')
	async getInventoryFlow(
		@Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
	) {
		return await this.statisticService.getInventoryFlow(limit);
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

}
