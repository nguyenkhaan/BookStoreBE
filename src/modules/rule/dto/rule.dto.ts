import {
	IsString,
	IsNotEmpty,
	IsDateString,
	IsOptional,
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
}
