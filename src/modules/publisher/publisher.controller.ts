import {
	Controller,
	DefaultValuePipe,
	Get,
	Query,
	UseGuards,
} from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/bases/guards/role.guard';

@Controller('publisher')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PublisherController {
	constructor(private readonly publisherService: PublisherService) {}
	@Get('search')
	async getAuthorByCode(
		@Query('name', new DefaultValuePipe('')) name: string,
	) {
		//Search author by name
		const responseData =
			await this.publisherService.getPublisherByName(name);
		return responseData;
	}
}
