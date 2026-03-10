import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterData } from "./dto/admin.dto";

@Injectable() 
export class AdminService 
{
    constructor(
        private readonly prismaService : PrismaService
    ) {} 
    async register(data : RegisterData) 
    {
        try 
        {
            let employee = await this.prismaService.employee.findFirst({
                where: {email : data.email}
            }) 
            if (employee) 
                throw new BadRequestException("Employee has been registered") 
            const hashPassword = await Bun.password.hash(data.password , {
                algorithm: 'bcrypt', 
                cost: 10 
            })
            employee = await this.prismaService.employee.create({
                data: {
                    ...data, 
                    password : hashPassword
                }
            })
            return {
                data, 
                success: true, 
                message: "Employee has been registered successfully"
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
    async updateEmployeeInformation() 
    {
        
    }
}