import { MemberGrade } from "@prisma/client";
import { IsEmail, IsEnum, IsString } from "class-validator";

export class UpdateCustomerDto 
{
    @IsString() 
    name?: string
    @IsEmail() 
    email? : string 
    @IsString() 
    phone? : string 

    @IsEnum(MemberGrade)
    grade?: MemberGrade
}