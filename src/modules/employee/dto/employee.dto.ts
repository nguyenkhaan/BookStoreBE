import { EmployeeCodeRegex } from '@/bases/commons/regex/app.regex';
import { PartialType } from '@nestjs/mapped-types';
import { EmployeeStatus } from '@prisma/client';
import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
	@IsString()
	@Matches(EmployeeCodeRegex , {
		message: "Employee code must be in format same as NV001"
	})
	code: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsString()
	name: string;

	@IsString()
	phone: string;

	@IsNumber()
	salary: number;

	@IsEnum(EmployeeStatus)
	status: EmployeeStatus;

	@IsNumber()
	departmentId: number;

	@IsNumber()
	positionId: number;

	@IsOptional()
	@IsString()
	avatar?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}