import { Type } from 'class-transformer';
import {
	IsOptional,
	IsString,
	IsBoolean,
	IsEnum,
	IsNumber,
} from 'class-validator';
import {
	BillStatus,
	EmployeeStatus,
	IncomeStatus,
	MemberGrade,
	OutcomeStatus,
	RuleStatus,
	RuleType,
} from '@prisma/client';

export class SearchCustomerDto {
	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	active?: boolean;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEnum(MemberGrade)
	grade?: MemberGrade;
}
export class SearchEmployeeDto {
	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	departmentId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	positionId?: number;

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	active?: boolean;

	// 👇 không đưa vào payload trực tiếp
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	salaryMin?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	salaryMax?: number;
}
export class SearchRuleDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsEnum(RuleStatus)
	status?: RuleStatus;

	@IsOptional()
	@IsEnum(RuleType)
	type?: RuleType;
}

export class SearchBookDto {
	title?: string;
	year?: number;

	authorName?: string;

	stockMin?: number;
	stockMax?: number;

	costMin?: number;
	costMax?: number;
}

export class SearchBillDto {
	code?: string;

	customerId?: number;

	status?: BillStatus;

	costMin?: number;
	costMax?: number;

	createdFrom?: Date;
	createdTo?: Date;
}

export class SearchOutcomeDto {
	code?: string;

	publisherId?: number;
	employeeId?: number;
	bookId?: number;

	status?: OutcomeStatus;

	costMin?: number;
	costMax?: number;

	quantityMin?: number;
	quantityMax?: number;

	createdFrom?: Date;
	createdTo?: Date;
}

export class SearchIncomeDto {
	code?: string;

	employeeId?: number;
	billId?: number;

	status?: IncomeStatus;

	costMin?: number;
	costMax?: number;

	shortDescription?: string;

	createdFrom?: Date;
	createdTo?: Date;
}
