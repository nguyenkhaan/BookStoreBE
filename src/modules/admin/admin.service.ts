import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterData } from "./dto/admin.dto";
import { JwtService } from "@nestjs/jwt";
import { TokenBody } from "@/bases/commons/enums/token.enum";
import { Role, TokenType } from "@prisma/client";
import { VERIFY_RESET_TIME } from "@/bases/commons/constants/jwt.constant";
import { ConfigService } from "@nestjs/config";
import { hashSHA256 } from "@/utilitis/sha256";

@Injectable() 
export class AdminService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService 
    ) {} 
    async register(data : RegisterData) 
    {
        try 
        {
            let employee = await this.prismaService.employee.findFirst({
                where: {email : data.email}
            }) 
            if (employee && employee.active) 
                throw new BadRequestException("Employee has been registered") 
            const hashPassword = await Bun.password.hash(data.password , {
                algorithm: 'bcrypt', 
                cost: 10 
            })
            if (!employee) 
                employee = await this.prismaService.employee.create({
                    data: {
                        ...data, 
                        password : hashPassword, 
                        active: false 
                    }
                })
            //Create verify email token 
            const verifySecretKey = this.configService.get<string>('VERIFY_SECRET_KEY')
            const token = this.jwtService.sign({
                [TokenBody.EMAIL] : employee.email, 
                [TokenBody.SUB] : employee.id, 
                [TokenBody.PURPOSE] : TokenType.VERIFY_EMAIL
            } , {
                expiresIn : VERIFY_RESET_TIME, 
                secret: verifySecretKey
            })
            //Complete the role 
            await this.prismaService.userRole.create({
                data : {
                    userId: employee.id, 
                    role : Role.EMPLOYEE
                }
            })
            //Delete and store the token 
            await this.prismaService.token.deleteMany({
                where: {
                    type: TokenType.VERIFY_EMAIL, 
                    employeeId: employee.id 
                }
            })
            const hashToken = hashSHA256(token) 
            await this.prismaService.token.create({
                data: {
                    token : hashToken, 
                    employeeId: employee.id, 
                    type : TokenType.VERIFY_EMAIL, 
                    expiresAt: new Date(Date.now() + 1000 * VERIFY_RESET_TIME)
                }
            })
            //Send email ---- Do later 

            return {
                data, 
                success: true, 
                message: "Employee has been registered successfully. Please verify your email", 
                token  
            }

        } 
        catch (err) 
        {
            console.log("Register Account Error: " , err) 
            if (err instanceof BadRequestException) 
                throw err 
            throw err 
        }
    }
    
    async resetPasswordForEmployee() 
    {
        //Reset to default password and sent this default password to employee's email 
    } 
    async resetEmailForEmployee() 
    {
        //Trong truong hop email cua cong ty bi loi thi tien hanh chuyen doi sang email khac 
    }
}