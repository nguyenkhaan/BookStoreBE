import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { VoucherModule } from '../voucher/voucher.module';
import { VoucherService } from '../voucher/voucher.service';
import { CustomerModule } from '../customer/customer.module';
import { CustomerService } from '../customer/customer.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [AuthModule, VoucherModule, CustomerModule, InventoryModule],
	controllers: [BillController],
	providers: [BillService, VoucherService, CustomerService],
})
export class BillModule {}
