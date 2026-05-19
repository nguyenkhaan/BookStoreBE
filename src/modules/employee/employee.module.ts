import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmailModule } from '../email/email.module';
@Module({
	imports: [AuthModule , EmailModule],
	controllers: [EmployeeController],
	providers: [EmployeeService],
	exports: [EmployeeService],
})
export class EmployeeModule {}
