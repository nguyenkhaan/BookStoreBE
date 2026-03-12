import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';

@Module({
	imports: [AuthModule],
	providers: [RuleService],
	controllers: [RuleController],
})
export class RuleModule {}
