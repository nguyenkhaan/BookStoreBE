import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterData, UpdateEmployeeData } from './dto/admin.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenBody } from '@/bases/commons/enums/token.enum';
import { Role, TokenType } from '@prisma/client';
import { VERIFY_RESET_TIME } from '@/bases/commons/constants/jwt.constant';
import { ConfigService } from '@nestjs/config';
import { hashSHA256 } from '@/utilitis/sha256';
import { EmployeeService } from '../employee/employee.service';
import { generateRandomPassword } from '@/utilitis/randomPassword';

@Injectable()
export class AdminService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly employeeService: EmployeeService,
	) {}
	async register(data: RegisterData) {
		try {
			let employee = await this.prismaService.employee.findFirst({
				where: { email: data.email },
			});
			if (employee && employee.active)
				throw new BadRequestException('Employee has been registered');
			const hashPassword = await Bun.password.hash(data.password, {
				algorithm: 'bcrypt',
				cost: 10,
			});
			if (!employee) {
				//Register and complete the role
				employee = await this.prismaService.employee.create({
					data: {
						...data,
						password: hashPassword,
						active: false,
					},
				});
				await this.prismaService.userRole.create({
					data: {
						userId: employee.id,
						role: Role.EMPLOYEE,
					},
				});
			}

			//Create verify email token
			const verifySecretKey =
				this.configService.get<string>('VERIFY_SECRET_KEY');
			const token = this.jwtService.sign(
				{
					[TokenBody.EMAIL]: employee.email,
					[TokenBody.SUB]: employee.id,
					[TokenBody.PURPOSE]: TokenType.VERIFY_EMAIL,
				},
				{
					expiresIn: VERIFY_RESET_TIME,
					secret: verifySecretKey,
				},
			);

			//Delete and store the token
			await this.prismaService.token.deleteMany({
				where: {
					type: TokenType.VERIFY_EMAIL,
					employeeId: employee.id,
				},
			});
			const hashToken = hashSHA256(token);
			await this.prismaService.token.create({
				data: {
					token: hashToken,
					employeeId: employee.id,
					type: TokenType.VERIFY_EMAIL,
					expiresAt: new Date(Date.now() + 1000 * VERIFY_RESET_TIME),
				},
			});
			//Send email ---- Do later

			return {
				data,
				success: true,
				message:
					'Employee has been registered successfully. Please verify your email',
				token,
			};
		} catch (err) {
			console.log('Register Account Error: ', err);
			if (err instanceof BadRequestException) throw err;
			throw err;
		}
	}

	async resetPasswordToDefault(id: number) {
		try {
			const employee = await this.employeeService.getEmployeeById(id);
			if (!employee)
				throw new BadRequestException('Cannot Find Employee To Update');
			const password = generateRandomPassword();
			const hashPassword = await Bun.password.hash(password, {
				cost: 10,
				algorithm: 'bcrypt',
			});

			await this.prismaService.employee.update({
				where: { id },
				data: {
					password: hashPassword,
				},
			});
			return {
				message: 'Password has been set to default',
				employeeId: id,
				email: employee.email,
				password,
			};
		} catch (err) {
			if (err instanceof BadRequestException) throw err;
			console.log(err);
			throw err;
		}
		//Reset to default password and sent this default password to employee's email
	}
	async resetEmailForEmployee() {
		//Trong truong hop email cua cong ty bi loi thi tien hanh chuyen doi sang email khac
	}
	async updateEmployeeInformation(id: number, employeeData: UpdateEmployeeData) 
	{
    	try {
    	    const employee = await this.prismaService.employee.update({
    	        where: {
    	            id: id
    	        },
    	        data: employeeData
    	    });

    	    return employee;
    	}
    	catch (err) {
    	    console.log("Update Employee Information Error", err);
    	    throw err;
    	}
	}
}
