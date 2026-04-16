import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IncomePaymentType } from '@prisma/client';
export class CreateIncomeDto {
	@IsString()
	code: string;

	@IsNumber()
	cost: number;

	@IsInt()
	billId: number;

	@IsString()
	shortDescription: string;

	@IsEnum(IncomePaymentType)
	payment: IncomePaymentType;
}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
