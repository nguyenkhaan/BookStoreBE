import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterData, UpdateEmployeeData } from './dto/admin.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenBody } from '@/bases/commons/enums/token.enum';
import { Role, TokenType } from '@prisma/client';
import { VERIFY_RESET_TIME } from '@/bases/commons/constants/jwt.constant';
import { ConfigService } from '@nestjs/config';
import { hashSHA256 } from '@/utlitis/sha256';
import { EmployeeService } from '../employee/employee.service';
import { generateRandomPassword } from '@/utlitis/randomPassword';
import { ResponseBody } from '@/bases/commons/enums/response.enum';
import type { Express } from 'express';
import { MinioService } from '@/minio/minio.service';
import { DEFAULT_AVATAR } from '@/bases/commons/constants/app.constant';
import { EmailService } from '../email/email.service';
@Injectable()
export class AdminService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly employeeService: EmployeeService,
		private readonly minioService: MinioService,
		private readonly emailService : EmailService
	) {}
	async resetCustomerEmail(phone: string) {
		//Tai khoan nay phai la 1 khach hang thuc thu va khong bi vo hieu hoa
		const customer = await this.prismaService.customer.findFirst({
			where: { phone },
		});
		if (customer && customer.code && customer.email) {
			//Day khong phai khach vang lai
		}
	}
	async register(data: RegisterData, file: Express.Multer.File) {
		try {
			let fileUrl: string | null = null;
			if (file) fileUrl = await this.minioService.uploadFile(file);
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
						avatar: fileUrl,
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
	async resetEmployeePassword(employeeId: number) {
		const employee = await this.prismaService.employee.findFirst({
			where: { id: employeeId },
		});
		if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');
		const password = generateRandomPassword();
		const hashedPassword = await Bun.password.hash(password, {
			algorithm: 'bcrypt',
			cost: 10,
		});
		await this.prismaService.employee.update({
			where: { id: employeeId },
			data: {
				password: hashedPassword,
			},
		});
		await this.emailService.sendWelcomeMail(
			employee.email,
			'[UtahimeBook] Thông báo đặt lại mật khẩu',
			'reset_password',
			{
				password,
			},
		);
		return {
			message:
				'Đặt lại mật khẩu thành công. Hãy kiểm tra hòm thư của bạn',
		};
	}

	async resetCustomerPassword(customerId: number) {
		const customer = await this.prismaService.customer.findFirst({
			where: { id: customerId },
		});
		if (!customer || !customer.email) throw new NotFoundException('Không tìm thấy nhân viên');
		const password = generateRandomPassword();
		const hashedPassword = await Bun.password.hash(password, {
			algorithm: 'bcrypt',
			cost: 10,
		});
		await this.prismaService.employee.update({
			where: { id: customerId },
			data: {
				password: hashedPassword,
			},
		});
		await this.emailService.sendWelcomeMail(
			customer.email,
			'[UtahimeBook] Thông báo đặt lại mật khẩu',
			'reset_password',
			{
				password,
			},
		);
		return {
			message:
				'Đặt lại mật khẩu thành công. Hãy kiểm tra hòm thư của bạn',
		};
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
	async updateEmployeeInformation(
		id: number,
		file: Express.Multer.File,
		employeeData: UpdateEmployeeData,
	) {
		try {
			const oldEmployee = await this.prismaService.employee.findUnique({
				where: {
					id: id,
				},
			});
			let url = null;
			if (!oldEmployee)
				throw new BadRequestException('Not Found Employee To Update');
			let oldFileName: string | null = oldEmployee.avatar;
			if (file) {
				if (oldFileName)
					await this.minioService.deleteFile(oldFileName);
				oldFileName = await this.minioService.uploadFile(file);
				// his.minioService.getFileUrl(oldFileName))
				url = await this.minioService.getFileUrl(oldFileName);
			}
			const employee = await this.prismaService.employee.update({
				where: {
					id: id,
				},
				data: {
					...employeeData,
					avatar: oldFileName,
				},
			});
			return {
				...employee,
				avatar: url ? url : DEFAULT_AVATAR,
			};
		} catch (err) {
			if (err instanceof BadRequestException) throw err;
			console.log('Update Employee Information Error', err);
			throw err;
		}
	}
	async deleteEmployeeAccount(employeeId: number) {
		try {
			const employee = this.employeeService.getEmployeeById(employeeId);
			if (employee != null)
				await this.prismaService.employee.update({
					where: {
						id: employeeId,
					},
					data: {
						deletedAt: new Date(),
					},
				});
			return {
				[ResponseBody.MESSAGE]: 'Delete Account Successfully',
				[ResponseBody.ERROR]: 0,
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
}
