import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PartialType } from "@nestjs/swagger";
export class CreateBookData {

  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsInt()
  publisherId: number;

  @IsInt()
  authorId: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}

export class UpdateBookData extends PartialType(CreateBookData) {}