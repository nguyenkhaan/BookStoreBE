import { BillStatus } from '@prisma/client';
import {
	IsInt,
	IsString,
	IsOptional,
	IsNotEmpty,
	IsArray,
	ValidateNested,
	Min,
	IsEnum,
	Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { BillCodeRegex } from '@/bases/commons/regex/app.regex';

class CreateBillDetailData {
	@IsInt()
	bookId: number;   //Sua thanh code cua sach 

	@IsInt()
	@Min(1)
	quantity: number;
}

class CreateVoucherUsageData {
	@IsInt()
	voucherId: number;
}

export class CreateBillData {
	@IsString()
	@IsNotEmpty()
	@Matches(BillCodeRegex, {
		message: 'Bill code must be in format HD001',
	})
	code: string;

	@IsInt()
	customerId: number;  //Sua thanh phone -> Tao Bill bang phone 

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateBillDetailData)
	billDetails: CreateBillDetailData[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateVoucherUsageData)
	vouchers?: CreateVoucherUsageData[];

	@IsOptional()
	temporaryCost?: number;
	@IsOptional()
	cost?: number;
	@IsEnum(BillStatus)
	status: BillStatus;
}

class UpdateVoucherUsageData extends CreateVoucherUsageData {}
class UpdateBillDetailData extends CreateBillDetailData {}

export class UpdateBillData extends PartialType(CreateBillData) {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateBillDetailData)
	billDetails?: UpdateBillDetailData[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateVoucherUsageData)
	vouchers?: UpdateVoucherUsageData[];
}
