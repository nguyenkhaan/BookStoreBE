import { AuthModule } from "../auth/auth.module";
import { SettingController } from "./settings.controller"; 
import { SettingService } from "./settings.service"; 
import { Global, Module } from "@nestjs/common"; 

@Global() 
@Module({
    imports : [AuthModule], 
    exports: [SettingService], 
    providers: [SettingService], 
    controllers : [SettingController]
}) 
export class SettingModule { }