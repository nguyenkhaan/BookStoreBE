import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { RuleService } from './rule.service';
import { CreateRuleData, UpdateRuleData } from './dto/rule.dto';
import type { Request } from 'express';
@Controller('rule')
export class RuleController {
	constructor(private readonly ruleService: RuleService) {}
	@Get()
	async getAllRules() {
		const responseData = await this.ruleService.getAllRules();
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async createRule(@Body() ruleData: CreateRuleData, @Req() req: Request) {
		const id = (req.user as any).id;
		const responseData = await this.ruleService.createRule(ruleData, id);
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Put('/:ruleId')
	async updateRule(
		@Body() ruleData: UpdateRuleData,
		@Param('ruleId') ruleId: string,
	) {
		const responseData = await this.ruleService.updateRule(
			Number(ruleId),
			ruleData,
		);
		return responseData;
	}
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('/:ruleId')
	async deleteRule(@Param('ruleId') ruleId: string) {
		const responseData = await this.ruleService.deleteRule(Number(ruleId));
		return responseData;
	}
}
