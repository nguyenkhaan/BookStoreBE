import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EmployeeModule } from '../employee/employee.module';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [AuthModule, JwtModule, EmployeeModule , EmailModule],
	controllers: [AdminController],
	exports: [],
	providers: [AdminService],
})
export class AdminModule {}
