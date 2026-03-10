import { EmployeeStatus } from "@prisma/client";
import { IsEmail , IsString , IsNotEmpty, Matches, IsEnum, IsNumber } from "class-validator";
export class RegisterData 
{
    @IsNotEmpty() 
    @IsEmail() 
    email : string 
    @IsNotEmpty() 
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/, {
        message: 'Password at least 5 characters, including at least a characters and a number'
    })
    password: string 
    @IsString() 
    @Matches(/^\d{10,11}$/, {
        message: 'Phone number must between 10 and 11 numbers'
    })
    phone : string 
    @IsString() 
    name  : string 
    @IsEnum(EmployeeStatus , {
        message: "Employee status Khong phu hop"
    }) 
    status : EmployeeStatus 
    @IsNumber() 
    @IsNotEmpty() 
    departmentId: number 
    @IsNumber() 
    @IsNotEmpty() 
    positionId : number 

}