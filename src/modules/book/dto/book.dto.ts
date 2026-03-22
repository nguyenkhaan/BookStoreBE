import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { BookCodeRegex } from '@/bases/commons/regex/app.regex';
import { BookCategory } from '@prisma/client';

export class CreateBookData {
	@IsString()
	title: string;
	@IsString()
	@Matches(BookCodeRegex, {
		message: 'Book Code must be in format BK001',
	})
	@IsInt()
	year: number;
	code: string;
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
	category : BookCategory
	@IsOptional()
	@IsInt()
	@Type(() => Number)
	@Min(0)
	stock?: number;
}

export class UpdateBookData extends PartialType(CreateBookData) {}
