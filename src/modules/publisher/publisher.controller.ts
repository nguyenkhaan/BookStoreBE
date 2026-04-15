import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { Roles } from "@/bases/decorators/role.decorators";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "@/bases/guards/role.guard";

@Controller("author") 
@Roles(Role.EMPLOYEE) 
@UseGuards(JwtAuthGuard , RolesGuard)
export class PublisherController 
{
    constructor(
        private readonly publisherService : PublisherService
    ) {} 
    @Get("name")
    async getAuthorByCode(
        @Query("name") name : string 
    ) //Search author by name 
    {
        const responseData = await this.publisherService.getPublisherByName(name) 
        return responseData
    } 
}