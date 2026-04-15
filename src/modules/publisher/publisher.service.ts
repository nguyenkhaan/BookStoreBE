import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PublisherService {
	constructor(private readonly prismaService: PrismaService) {}
	async getPublisherByName(name: string) {
		try {
			const authors = await this.prismaService.author.findMany({
				where: {
					name: {
						contains: name,
						mode: 'insensitive', 
					},
				},
				select: {
					id: true,
					name: true,
				},
			});

			if (!authors.length) {
				throw new BadRequestException('Author not found');
			}

			return authors;
		} catch (err) {
			console.log('Get author by name', err);
			throw err;
		}
	}
}
