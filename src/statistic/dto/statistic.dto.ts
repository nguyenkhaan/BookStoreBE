import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class RevenueChartQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(120)
	month?: number;
}

export class TopCustomerQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}

export class RevenueChartItemDto {
	month: string;
	revenue: number;
}

export class CustomerDebitMonthlyItemDto {
	date: string;
	customer: {
		id: number;
		name: string;
	};
	openingDebt: number;
	generatedDebt: number;
	closingDebt: number;
}

export class TopCustomerItemDto {
	customerId: number;
	customerCode: string;
	customerName: string;
	email: string;
	phone: string;
	grade: string;
	totalPaid: number;
}
