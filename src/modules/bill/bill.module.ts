import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { VoucherModule } from '../voucher/voucher.module';
import { VoucherService } from '../voucher/voucher.service';
import { CustomerModule } from '../customer/customer.module';
import { CustomerService } from '../customer/customer.service';
import { InventoryModule } from '../inventory/inventory.module';
import { EmailModule } from '../email/email.module';
import { SettingModule } from '../settings/settings.module';

@Module({
	imports: [AuthModule, VoucherModule, CustomerModule, EmailModule , SettingModule ,  InventoryModule],
	controllers: [BillController],
	providers: [BillService, VoucherService, CustomerService],
	exports: [BillService]
})
export class BillModule {}
