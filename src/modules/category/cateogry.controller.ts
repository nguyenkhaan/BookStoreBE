import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
@Controller('category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}
	@Get() 
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard , RolesGuard)
	async getAllCategories() {
		return this.categoryService.getAll();
	}
}
