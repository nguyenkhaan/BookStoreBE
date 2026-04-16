import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublisherService {
	constructor(private readonly prismaService: PrismaService) {}
	async getPublisherByName(name: string) {
		try {
			const publishers = await this.prismaService.publisher.findMany({
				where: {
					name: {
						contains: name,
						mode: 'insensitive',
					},
				},
				orderBy: {
					name: 'asc',
				},
				take: 10,
			});
			return publishers;
		} catch (err) {
			console.log('Get author by name', err);
			throw err;
		}
	}
}
