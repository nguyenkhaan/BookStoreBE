import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
@Module({
	imports: [AuthModule],
	controllers: [IncomeController],
	providers: [IncomeService],
})
export class IncomeModule {}
