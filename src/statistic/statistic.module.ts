import { AuthModule } from '@/modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { StatisticRepository } from './statistic.repository';

@Module({
	imports: [AuthModule],
	providers: [StatisticService, StatisticRepository],
	controllers: [StatisticController],
})
export class StatisticModule {}
