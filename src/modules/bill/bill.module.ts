import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { VoucherModule } from '../voucher/voucher.module';

@Module({
	imports: [AuthModule , VoucherModule],
	controllers: [BillController],
	providers: [BillService],
})
export class BillModule {}
