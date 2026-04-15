import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { AuthModule } from '../auth/auth.module';
import { BookService } from './book.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [AuthModule , InventoryModule],
	exports: [],
	controllers: [BookController],
	providers: [BookService],
})
export class BookModule {}
