import { Module } from '@nestjs/common';
import { CategoryController } from './cateogry.controller';
import { CategoryService } from './category.service';
import { AuthModule } from '../auth/auth.module';
@Module({
	imports: [AuthModule],
	controllers: [CategoryController],
	exports: [CategoryService],
	providers: [CategoryService],
})
export class CategoryModule {}
