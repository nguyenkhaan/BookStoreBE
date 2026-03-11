import { Roles } from '@/bases/decorators/role.decorators';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { RuleService } from './rule.service';
import { CreateRuleData } from './dto/rule.dto';
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
}
