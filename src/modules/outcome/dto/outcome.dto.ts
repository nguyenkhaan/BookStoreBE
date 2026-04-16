import {
	IsInt,
	IsString,
	IsEnum,
	IsNumber,
	Min,
	IsNotEmpty,
	Matches,
} from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { STOCK_IMPORT_NUMBER_MIN } from '@/bases/commons/constants/app.constant';
import { BookCodeRegex } from '@/bases/commons/regex/app.regex';

export class CreateOutcomeData {
	@IsString()
	code: string;

	@IsInt()
	publisherId: number;

	@IsNumber()
	cost: number;

	@IsEnum(OutcomeStatus)
	status: OutcomeStatus;
	@IsInt()
	@Min(STOCK_IMPORT_NUMBER_MIN) //toi thieu phai nhap 150 sach - So sach ton kho it nhat la 300 sach, khong duoc nhap thap hon
	quantity: number;
	@Matches(BookCodeRegex)
	@IsNotEmpty()
	bookCode: string;
}
export class UpdateOutcomeData extends PartialType(CreateOutcomeData) {}
