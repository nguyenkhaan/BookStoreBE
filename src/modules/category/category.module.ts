import { Module } from "@nestjs/common"; 
import { CategoryController } from "./cateogry.controller";
import { CategoryService } from "./category.service";
@Module({
    imports: [], 
    controllers: [CategoryController], 
    exports: [CategoryService], 
    providers: [CategoryService] 
}) 
export class CategoryModule {}