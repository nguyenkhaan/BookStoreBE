import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorService } from "./author.service";
import { AuthorController } from "./author.controller";

@Module({
    imports: [AuthModule], 
    providers: [AuthorService], 
    controllers : [AuthorController]
}) 
export class AuthorModule {} 