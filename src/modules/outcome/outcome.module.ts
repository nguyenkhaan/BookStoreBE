import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OutcomeController } from './outcome.controller';
import { OutcomeService } from './outcome.service';
import { InventoryModule } from '../inventory/inventory.module';
import { SettingModule } from '../settings/settings.module';

@Module({
	imports: [AuthModule, InventoryModule , SettingModule],
	providers: [OutcomeService],
	controllers: [OutcomeController],
})
export class OutcomeModule {}
