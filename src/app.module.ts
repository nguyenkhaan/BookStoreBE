import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './modules/test/test.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './bases/filters/http-exception.filter';
import { LoggingInterceptor } from './bases/interceptors/logging.interceptos';
import { TransformInterceptor } from './bases/interceptors/transform.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { RuleModule } from './modules/rule/rule.module';
import { MinioModule } from './minio/minio.module';
import { BookModule } from './modules/book/book.module';
import { BillModule } from './modules/bill/bill.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { OutcomeModule } from './modules/outcome/outcome.module';
import { IncomeModule } from './modules/income/income.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './configs/app-redis-options.constants';
import { RedisModule } from './modules/redis/redis.module';
import { RateLimitGuard } from './bases/guards/rate-limit.guard';
import { BlacklistGuard } from './bases/guards/blacklist.guard';
import { SearchModule } from './modules/search/search.module';
import { StatisticModule } from './modules/statistic/statistic.module';
//Add  e module here
@Module({
	imports: [
		TestModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		CacheModule.registerAsync(RedisOptions),
		RedisModule,
		MinioModule,
		AuthModule,
		AdminModule,
		EmployeeModule,
		RuleModule,
		BookModule,
		BillModule,
		VoucherModule,
		OutcomeModule,
		IncomeModule,
		CustomerModule,
		SearchModule,
		StatisticModule
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: RateLimitGuard,
		},
		{
			provide: APP_GUARD,
			useClass: BlacklistGuard,
		},
	],
})
export class AppModule {}
