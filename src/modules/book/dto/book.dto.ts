import {
	IsArray,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { BookCodeRegex } from '@/bases/commons/regex/app.regex';

export class CreateBookData {
	@IsString()
	title: string;
	@IsString()
	@Matches(BookCodeRegex, {
		message: 'Book Code must be in format BK001',
	})
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

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	@Min(0)
	stock?: number;
}

export class UpdateBookData extends PartialType(CreateBookData) {}
