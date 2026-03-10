import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import {  TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBody } from '@/bases/commons/enums/token.enum';
import { ACCESS_LIVE_TIME, REFRESH_LIVE_TIME } from '@/bases/commons/constants/jwt.constant';
import { hashSHA256 } from '@/utilitis/sha256';

@Injectable()
export class AuthService 
{
    //this is the simple Authentication. You can config it to suitable for your job 
    constructor(
        private readonly prismaService: PrismaService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService
    ) {}
    async validateUser(email: string, password: string) {
        try 
        {
            const user = await this.prismaService.employee.findFirst({
                where: {
                    email 
                }
            }) 
            if (!user) 
                throw new UnauthorizedException("Employee has not been registered") 
            const results = await Bun.password.verify(password , user.password)  
            if (results) 
                return user 
            return null  
        } 
        catch (err) 
        {
            console.log("Valdating User Error: " , err) 
            throw err 
        }
    }
   
    async login(email : string , password : string) 
    {
        try 
        {
            const employee = await this.prismaService.employee.findUnique({
                where: {
                    email
                }
            })
            if (!employee)  
                throw new UnauthorizedException("User has not been registered") 
            //So sanh password 
            const result = await Bun.password.verify(password , employee.password) 
            if (!result) 
                throw new BadRequestException("Wrong Password") 
            const roles = await this.prismaService.userRole.findMany({
                where: {
                    userId : employee.id 
                }, 
                select: {
                    role: true 
                }
            })
            const userRoles = roles.map(roleO => roleO.role) 
            if (!roles) 
                throw new BadRequestException("Don't have roles") 
            const accessSecretKey = this.configService.get<string>('ACCESS_SECRET_KEY')
            const refreshSecretKey = this.configService.get<string>('REFRESH_SECRET_KEY')
            const payload = {
                [TokenBody.EMAIL] : employee.email, 
                [TokenBody.SUB] : employee.id, 
                [TokenBody.ROLES] : userRoles 
            }
            const accessToken = this.jwtService.sign({
                ...payload, 
                [TokenBody.PURPOSE] : TokenType.ACCESS
            } , {
                expiresIn: ACCESS_LIVE_TIME, 
                secret: accessSecretKey
            }) 
            const refreshToken = this.jwtService.sign({
                ...payload , 
                [TokenBody.PURPOSE] : TokenType.REFRESH
            } , {
                expiresIn: REFRESH_LIVE_TIME, 
                secret: refreshSecretKey 
            }) 
            //Store token into table 
            await this.prismaService.token.deleteMany({
                where: {
                    employeeId: employee.id,
                    type: {
                        in: [TokenType.ACCESS, TokenType.REFRESH]
                    }
                }
            })
            const hashAccessToken = hashSHA256(accessToken)
            const hashRefreshToken = hashSHA256(refreshToken)
            await this.prismaService.token.create({
                data: {
                    token : hashAccessToken, 
                    type: TokenType.ACCESS, 
                    employeeId: employee.id, 
                    expiresAt: new Date(Date.now() + ACCESS_LIVE_TIME)
                }
            })
                        await this.prismaService.token.create({
                data: {
                    token : hashRefreshToken, 
                    type: TokenType.REFRESH, 
                    employeeId: employee.id, 
                    expiresAt: new Date(Date.now() + REFRESH_LIVE_TIME)
                }
            })
            
            return {
                id : employee.id, 
                email : employee.email, 
                accessToken, 
                refreshToken
            }
        } 
        catch (err) 
        {
            console.log("Login Error: " , err) 
            throw err 
        }
    }
}
