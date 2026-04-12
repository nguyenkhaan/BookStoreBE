import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { MemberGrade } from '@prisma/client';

export class CreateCustomerData {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(MemberGrade)
    @IsOptional()
    grade?: MemberGrade;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateCustomerData {
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
