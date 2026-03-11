import { Roles } from "@/bases/decorators/role.decorators";
import { Controller, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "@/bases/guards/role.guard";

@Controller("rule") 
@Roles(Role.ADMIN) 
@UseGuards(JwtAuthGuard , RolesGuard)
export class RuleController 
{

}