import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [AuthModule , EmailModule],
	controllers: [CustomerController],
	providers: [CustomerService],
	exports: [CustomerService],
})
export class CustomerModule {}
