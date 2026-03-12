import { Module } from "@nestjs/common";
import { BookController } from "./book.controller";
import { AuthModule } from "../auth/auth.module";
import { BookService } from "./book.service";

@Module({
    imports: [AuthModule], 
    exports: [], 
    controllers: [BookController], 
    providers: [BookService]
})
export class BookModule {} 