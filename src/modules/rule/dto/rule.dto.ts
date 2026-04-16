import { RuleStatus, RuleType } from '@prisma/client';
import {
	IsString,
	IsNotEmpty,
	IsDateString,
	IsOptional,
	IsEnum,
} from 'class-validator';

export class CreateRuleData {
	@IsString()
	@IsNotEmpty()
	title: string;
	@IsString()
	@IsNotEmpty()
	content: string;
	@IsDateString()
	appliedAt: string; //2026-ạ03-12

	@IsEnum(RuleType)
	type: RuleType;
	@IsEnum(RuleStatus)
	status: RuleStatus;
	@IsNotEmpty()
	@IsString()
	shortDescription: string;
}
export class UpdateRuleData {
	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	content?: string;

	@IsDateString()
	@IsOptional()
	appliedAt?: string;
	@IsString()
	@IsOptional()
	shortDescription?: string;
	@IsOptional()
	type?: RuleType;
	@IsEnum(RuleStatus)
	@IsOptional()
	status?: RuleStatus;
}
