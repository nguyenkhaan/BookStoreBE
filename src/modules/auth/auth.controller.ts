import { Controller, Get,  Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import type {Request}  from 'express';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { RolesGuard } from '@/bases/guards/role.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController 
{
    constructor(
        private readonly authService : AuthService 
    ) {} 
    @Get('verify')
    async verify(@Query('token') token: String) 
    {
      console.log(token) 
    }
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req : Request) {
        const {email , password} = req.body 
        const responseData = await this.authService.login(email , password) 
        return responseData 

    } 
    @Post('testing') 
    // @UseGuards(JwtAuthGuard)
    @Roles([Role[Role.CUSTOMER]]) 
    @UseGuards(JwtAuthGuard , RolesGuard)  //Run Guards in order. You can see it in the console.log  
    async test() 
    {
        
        return "Testing successfully" 
    }
}
