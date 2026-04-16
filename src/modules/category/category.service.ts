import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookCategory } from '@prisma/client';
@Injectable()
export class CategoryService {
	constructor(private readonly prismaService: PrismaService) {}
	async getAll() {
		return Object.values(BookCategory);
	}
}
