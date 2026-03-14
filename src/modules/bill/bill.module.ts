import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { BillController } from "./bill.controller";
import { BillService } from "./bill.service";

@Module({
    imports: [AuthModule], 
    controllers: [BillController], 
    providers: [BillService]

}) 
export class BillModule 
{

}