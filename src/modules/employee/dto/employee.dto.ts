import { EmployeeStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeInformation {
	@IsOptional()
	@IsString()
	name: string;
	@IsOptional()
	@IsString()
	phone: string;

	@IsOptional()
	@IsNumber()
	salary: number;
	@IsOptional()
	@IsEnum(EmployeeStatus)
	status: EmployeeStatus;
	@IsNumber()
	@IsOptional()
	departmentId: number;
	@IsNumber()
	@IsOptional()
	positionId: number;
}
