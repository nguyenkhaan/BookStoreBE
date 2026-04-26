import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IncomePaymentType, IncomeStatus } from '@prisma/client';
export class CreateIncomeDto {
	@IsString()
	code: string;

	@IsNumber()
	cost: number;

	@IsString()
	billCode: string;

	@IsString()
	shortDescription: string;

	@IsEnum(IncomePaymentType)
	paymentMethod: IncomePaymentType;

	@IsEnum(IncomeStatus) 
	status : IncomeStatus
}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
