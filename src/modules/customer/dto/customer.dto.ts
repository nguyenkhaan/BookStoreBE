import { MemberGrade } from '@prisma/client';
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class UpdateCustomerDto {
	@IsString()
	@IsOptional()
	name?: string;
	@IsEmail()
	@IsOptional()
	email?: string;
	@IsString()
	@IsOptional()
	phone?: string;

	@IsEnum(MemberGrade)
	@IsOptional()
	grade?: MemberGrade;

	@IsBoolean()
	@IsOptional()
	active?: boolean;
}

export class CreateCustomerDto {
	@IsString()
	@MinLength(3)
	code: string;

	@IsString()
	@MinLength(2)
	name: string;

	@IsEmail()
	email: string;

	@IsString()
	phone: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsEnum(MemberGrade)
	grade: MemberGrade;
}
