import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OutcomeController } from './outcome.controller';
import { OutcomeService } from './outcome.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [AuthModule, InventoryModule],
	providers: [OutcomeService],
	controllers: [OutcomeController],
})
export class OutcomeModule {}
