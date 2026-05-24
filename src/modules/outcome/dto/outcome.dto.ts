import {
	IsArray,
	IsInt,
	IsString,
	IsEnum,
	IsNumber,
	Min,
	IsNotEmpty,
	IsOptional,
	ValidateNested,
	ArrayMinSize,
} from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateOutcomeItemDto {
	@IsNotEmpty()
	@IsString()
	code: string;

	@IsNumber()
	@Min(0)
	@IsOptional()
	baseCost: number;

	@IsInt()
	quantity: number;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	bookTitle: string;

	@IsOptional()
	@IsNumber()
	year?: number;

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	publisherIds: number[];

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	authorIds: number[];
}

export class CreateOutcomeData {
	@IsInt()
	publisherId: number;

	@IsEnum(OutcomeStatus)
	status: OutcomeStatus;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateOutcomeItemDto)
	items: CreateOutcomeItemDto[];
}

export class UpdateOutcomeData {
	@IsOptional()
	@IsInt()
	publisherId?: number;

	@IsOptional()
	@IsEnum(OutcomeStatus)
	status?: OutcomeStatus;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateOutcomeItemDto)
	items?: CreateOutcomeItemDto[];
}
