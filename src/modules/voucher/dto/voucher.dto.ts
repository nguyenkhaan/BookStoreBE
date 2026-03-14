import { PartialType } from '@nestjs/swagger'
import { VoucherStatus, VoucherType } from '@prisma/client'
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsDateString
} from 'class-validator'

export class CreateVoucherData {

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  eventName: string

  @Min(0)
  sale: number

  @IsEnum(VoucherStatus)
  status: VoucherStatus

  @IsInt()
  @Min(0)
  quantity: number

  @IsDateString()
  expiresAt: string

  @IsEnum(VoucherType)
  type: VoucherType
}

export class UpdateVoucherData extends PartialType(CreateVoucherData) {}