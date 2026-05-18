import { MemberGrade } from '@prisma/client';
import {
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

}

export class CreateCustomerDto {
	@IsString()
	@MinLength(2)
	name: string;

	@IsEmail()
	email: string;

	@IsString()
	phone: string;

	// @IsString()
	// @MinLength(6)
	// password: string;

	@IsEnum(MemberGrade)
	grade: MemberGrade;
}
