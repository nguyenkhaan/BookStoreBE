import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { Roles } from "@/bases/decorators/role.decorators";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "@/bases/guards/role.guard";

@Controller("author") 
@Roles(Role.EMPLOYEE) 
@UseGuards(JwtAuthGuard , RolesGuard)
export class AuthorController 
{
    constructor(
        private readonly authorService : AuthorService
    ) {} 
    @Get("code")
    async getAuthorByCode(
        @Query("code") code : string 
    ) //Search author by name 
    {
        const responseData = await this.authorService.getAuthorByCode(code) 
        return responseData
    } 
}