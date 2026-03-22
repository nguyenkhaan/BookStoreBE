import { AuthModule } from "@/modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { StatisticService } from "./statistic.service";
import { StatisticController } from "./statistic.controller";

@Module({
    imports: [AuthModule], 
    providers: [StatisticService], 
    controllers: [StatisticController]
}) 
export class StatisticModule {} 