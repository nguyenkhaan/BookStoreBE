import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { BookCategory } from '@prisma/client';
import { STOCK_IMPORT_NUMBER_MIN } from '@/bases/commons/constants/app.constant';

export class CreateBookData {
	@IsString()
	title: string;
	@IsString()
	code: string;

	@IsNumber()
	@Type(() => Number)
	year: number;
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	cost: number;

	@Transform(({ value }) => JSON.parse(value))
	@IsArray()
	@IsInt({ each: true })
	publisherIds: number[];

	@Transform(({ value }) => JSON.parse(value))
	@IsArray()
	@IsInt({ each: true })
	authorIds: number[];
	@IsEnum(BookCategory)
	category: BookCategory;
	@IsOptional()
	@IsInt()
	@Type(() => Number)
	@Min(STOCK_IMPORT_NUMBER_MIN)
	stock?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	baseCost?: number;
}

export class UpdateBookData extends PartialType(CreateBookData) {}
