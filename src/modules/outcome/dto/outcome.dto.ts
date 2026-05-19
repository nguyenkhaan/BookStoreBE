import {
	IsArray,
	IsInt,
	IsString,
	IsEnum,
	IsNumber,
	Min,
	IsNotEmpty,
	Matches,
	IsOptional,
	ValidateNested,
} from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { STOCK_IMPORT_NUMBER_MIN } from '@/bases/commons/constants/app.constant';
import { BookCodeRegex } from '@/bases/commons/regex/app.regex';
import { Type } from 'class-transformer';

export class CreateOutcomeItemDto {
	@Matches(BookCodeRegex)
	@IsNotEmpty()
	@IsString()
	code: string;

	@IsNumber()
	@Min(0)
	@IsOptional()
	baseCost: number;

	@IsInt()
	@Min(STOCK_IMPORT_NUMBER_MIN) //toi thieu phai nhap 150 sach - So sach ton kho it nhat la 300 sach, khong duoc nhap thap hon
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
	@IsInt({each : true})
	publisherIds : number[] 
	@IsOptional() 
	@IsArray() 
	@IsInt({each : true })
	authorIds: number[] 
}

export class CreateOutcomeData {
	@IsInt()
	publisherId: number;

	@IsEnum(OutcomeStatus)
	status: OutcomeStatus;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateOutcomeItemDto)
	items: CreateOutcomeItemDto[];
}
export class UpdateOutcomeData extends PartialType(CreateOutcomeItemDto) {
	@IsOptional()
	@IsInt()
	publisherId?: number;

	@IsOptional()
	@IsEnum(OutcomeStatus)
	status?: OutcomeStatus;
}
