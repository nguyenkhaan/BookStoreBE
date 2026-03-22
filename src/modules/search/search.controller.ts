import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { Roles } from '@/bases/decorators/role.decorators';

import { Role } from '@prisma/client';

import {
	SearchBillDto,
	SearchBookDto,
	SearchCustomerDto,
	SearchEmployeeDto,
	SearchIncomeDto,
	SearchOutcomeDto,
	SearchRuleDto,
} from './type/search.type';
import { SALARY_MAX } from '@/bases/commons/constants/app.constant';

@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get('customer')
	async findCustomer(@Query() query: SearchCustomerDto) {
		return this.searchService.findCustomer(query);
	}

	@Get('employee')
	async findEmployee(@Query() query: SearchEmployeeDto) {
		const { salaryMin = 0, salaryMax = SALARY_MAX, ...payload } = query;

		return this.searchService.findEmployee(payload, salaryMin, salaryMax);
	}
	@Get('rule')
	async findRule(@Query() query: SearchRuleDto) {
		// return this.searchService.findRule(query);
		const responseData = await this.searchService.findRule(query);
		return responseData;
	}

	@Get('book')
	async findBook(@Query() query: SearchBookDto) {
		const responseData = await this.searchService.findBook(query);
		return responseData;
	}
	@Get('bill')
	async findBill(@Query() query: SearchBillDto) {
		const responseData = await this.searchService.findBill(query);
		return responseData;
	}
	@Get('income')
	async findIncome(@Query() query: SearchIncomeDto) {
		const responseData = await this.searchService.findIncome(query);
		return responseData;
	}
	@Get('outcome')
	async findOutcome(@Query() query: SearchOutcomeDto) {
		const responseData = await this.searchService.findOutcome(query);
		return responseData;
	}
}
