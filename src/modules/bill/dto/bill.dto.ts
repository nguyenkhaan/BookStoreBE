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

} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
// import { BillCodeRegex } from '@/bases/commons/regex/app.regex';

class CreateBillDetailData {
	@IsString()
	@IsNotEmpty()
	bookCode: string;

	@IsInt()
	@Min(1)
	quantity: number;
}

class CreateVoucherUsageData {
	@IsInt()
	voucherId: number;
}

export class CreateBillData {
	// @IsInt()
	// customerId: number;  //Sua thanh phone -> Tao Bill bang phone
	@IsString()
	customerPhone: string;

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
