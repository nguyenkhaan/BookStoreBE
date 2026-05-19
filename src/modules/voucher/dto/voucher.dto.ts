import { PartialType } from '@nestjs/mapped-types';
import { VoucherStatus, VoucherType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsString,
	IsNotEmpty,
	IsEnum,
	IsInt,
	Min,
	IsOptional,
	IsDate,
	IsNumber,
} from 'class-validator';

export class CreateVoucherData {
	
	@IsNumber()
	usedNumber: number;
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	eventName: string;
	@IsNumber()
	@Type(() => Number)
	@Min(0)
	sale: number;

	@IsEnum(VoucherStatus)
	status: VoucherStatus;

	@IsInt()
	@Min(0)
	quantity: number;
	@IsString()
	@IsOptional()
	description: string;

	@Type(() => Date)
	@IsDate()
	expiresAt: Date;
	@Type(() => Date)
	@IsDate()
	startDate: Date;
	@IsEnum(VoucherType)
	type: VoucherType;
}

export class UpdateVoucherData extends PartialType(CreateVoucherData) {}
