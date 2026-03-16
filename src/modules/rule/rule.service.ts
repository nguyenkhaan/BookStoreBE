import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRuleData, UpdateRuleData } from './dto/rule.dto';

@Injectable()
export class RuleService {
	constructor(private readonly prismaService: PrismaService) {}
	async getAllRules() {
		try {
			const rules = await this.prismaService.rule.findMany();
			return rules;
		} catch (err) {
			console.log('Get all Rules Error', err);
			throw err;
		}
	}

	async createRule(data: CreateRuleData, creatorId: number) {
		try {
			if (!creatorId)
				throw new BadRequestException('Token Invalid or Expires');
			const rule = await this.prismaService.rule.create({
				data: {
					title: data.title,
					content: data.content,
					appliedAt: new Date(data.appliedAt),
					creatorId: creatorId,
					status : data.status, 
					shortDescription : data.shortDescription, 
					type : data.type
				},
			});
			return rule;
		} catch (err) {
			if (err instanceof BadRequestException) throw err;
			console.log('Create Rule Error', err);
			throw err;
		}
	}
	async updateRule(id: number, data: UpdateRuleData) {
		return this.prismaService.rule.update({
			where: { id },
			data: {
				title: data.title,
				content: data.content,
				appliedAt: data.appliedAt
					? new Date(data.appliedAt)
					: undefined,
			},
		});
	}

	async deleteRule(id: number) {
		try {
			const rule = await this.prismaService.rule.delete({
				where: {
					id: id,
				},
			});

			return rule;
		} catch (err) {
			console.log('Delete Rule Error', err);
			throw err;
		}
	}
}
