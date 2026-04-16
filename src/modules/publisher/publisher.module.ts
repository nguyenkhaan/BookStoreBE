import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
@Module({
	imports: [AuthModule],
	providers: [PublisherService],
	controllers: [PublisherController],
})
export class PublisherModule {}
