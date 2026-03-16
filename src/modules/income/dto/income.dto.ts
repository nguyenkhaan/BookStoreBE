import { IsInt, IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
export class CreateIncomeDto {
	@IsString()
	code: string;

	@IsNumber()
	cost: number;

	@IsInt()
	billId: number;

	@IsString()
	shortDescription: string;
}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
