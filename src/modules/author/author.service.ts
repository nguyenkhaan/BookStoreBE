import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable() 
export class AuthorService   
{
    constructor(
        private readonly prismaService : PrismaService 
    ) {} 
    async getAuthorByCode(code : string) 
    {
        try 
        {
            const author = this.prismaService.author.findFirst({
                where: { code }, 
                select: { id : true , code : true } 

            })   
            if (!author) 
                throw new BadRequestException("Author Not Found") 
            return author 
        } 
        catch (err) 
        {
            console.log("Get author by name" , err) 
            throw err 
        }
    }
}