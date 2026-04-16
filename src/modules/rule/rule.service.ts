import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRuleData, UpdateRuleData } from './dto/rule.dto';
import { RuleStatus, RuleType } from '@prisma/client';

@Injectable()
export class RuleService {
	constructor(private readonly prismaService: PrismaService) {}
	async getGeneralStatistic() {
		try {
			const totalRules = await this.prismaService.rule.aggregate({
				_count: { id: true },
			});
			const applying = await this.prismaService.rule.aggregate({
				_count: { id: true },
				where: {
					status: RuleStatus.APPLYING,
				},
			});
			const upcoming = await this.prismaService.rule.aggregate({
				_count: { id: true },
				where: {
					status: RuleStatus.UPCOMING,
				},
			});
			const reject = await this.prismaService.rule.aggregate({
				_count: { id: true },
				where: {
					status: RuleStatus.REJECT,
				},
			});
			return {
				totalRules: totalRules._count.id,
				applying: applying._count.id,
				upcoming: upcoming._count.id,
				reject: reject._count.id,
			};
		} catch (err) {
			console.log('Error get rule statistic', err);
			throw err;
		}
	}
	async getOptions() {
		return {
			type: Object.values(RuleType),
			status: Object.values(RuleStatus),
		};
	}
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
					status: data.status,
					shortDescription: data.shortDescription,
					type: data.type,
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
				...(data.title !== undefined && { title: data.title }),
				...(data.content !== undefined && { content: data.content }),
				...(data.shortDescription !== undefined && {
					shortDescription: data.shortDescription,
				}),
				...(data.status !== undefined && { status: data.status }),
				...(data.type !== undefined && { type: data.type }),
				...(data.appliedAt !== undefined && {
					appliedAt: new Date(data.appliedAt),
				}),
			},
		});
	}
	async getRuleById(id : number) 
	{
		try 
		{
			const rule = await this.prismaService.rule.findFirst({
				where: { id }
			}) 
			if (!rule) 
				throw new BadRequestException("rule not found") 
			return rule 
		}  
		catch (err) {
			console.log("get rule by id error" , err) 
			throw err
		}
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
