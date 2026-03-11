import { TokenBody } from "@/bases/commons/enums/token.enum";
import { PrismaService } from "@/prisma/prisma.service";
import { hashSHA256 } from "@/utilitis/sha256";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TokenType } from "@prisma/client";

@Injectable() 
export class EmployeeService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService 
    ) {} 
    async getEmployeeById(id : number) 
    {
        const employee = await this.prismaService.employee.findFirst({
            where: {
                id  
            }
        }) 
        return employee 
    }
    async verifyEmployeeAccount(token: string) 
    {
        try 
        {
            const verifySecretKey = this.configService.get<string>('VERIFY_SECRET_KEY')

            const payload = this.jwtService.verify(token, {
                secret: verifySecretKey
            })
            if (payload[TokenBody.PURPOSE] !== TokenType.VERIFY_EMAIL)
                throw new BadRequestException("Invalid token purpose")
            const hashToken = hashSHA256(token)
            const storedToken = await this.prismaService.token.findFirst({
                where: {
                    token: hashToken,
                    type: TokenType.VERIFY_EMAIL,
                    employeeId: payload[TokenBody.SUB],
                    expiresAt: {
                        gt: new Date()
                    }
                }
            })
            if (!storedToken)
                throw new BadRequestException("Token invalid or expired")
            await this.prismaService.employee.update({
                where: {
                    id: payload[TokenBody.SUB]
                },
                data: {
                    active: true
                }
            })
            await this.prismaService.token.deleteMany({
                where: {
                    employeeId: payload[TokenBody.SUB],
                    type: TokenType.VERIFY_EMAIL
                }
            })
            return {
                success: true,
                message: "Email verified successfully"
            }
        } 
            catch (err) {
            console.log("Verify Employee Error:", err)
            throw new BadRequestException("Invalid or expired verification token")
            }
    }
    
}