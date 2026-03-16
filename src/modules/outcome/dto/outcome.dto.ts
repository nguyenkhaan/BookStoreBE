import {
	IsInt,
	IsString,
	IsEnum,
	IsNumber,
	Min,
	IsNotEmpty,
} from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOutcomeData {
	@IsString()
	code: string;

	@IsInt()
	publisherId: number;

	@IsNumber()
	cost: number;

	@IsEnum(OutcomeStatus)
	status: OutcomeStatus;
	@IsInt()
	@Min(0)
	quantity: number;
	@IsInt()
	@Min(1)
	@IsNotEmpty()
	bookId: number;
}
export class UpdateOutcomeData extends PartialType(CreateOutcomeData) {}
