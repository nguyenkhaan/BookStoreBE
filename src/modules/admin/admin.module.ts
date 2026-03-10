import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
    imports: [AuthModule , JwtModule], 
    controllers: [AdminController], 
    exports: [], 
    providers: [AdminService] 
}) 
export class AmdinModule 
{

}