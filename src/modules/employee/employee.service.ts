import { TokenBody } from '@/bases/commons/enums/token.enum';
import { PrismaService } from '@/prisma/prisma.service';
import { hashSHA256 } from '@/utlitis/sha256';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmployeeStatus, Role, TokenType } from '@prisma/client';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class EmployeeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
	) {}
	async findEmployeeByCode(code: string) {
		const employee = await this.prismaService.employee.findFirst({
			where: { code },
		});
		return employee;
	}
	async createAccount(data: CreateEmployeeDto) {
		try {
			const result = await this.prismaService.$transaction(async (tx) => {
				const existedEmployee = await tx.employee.findFirst({
					where: {
						OR: [
							{code : data.code }, 
							{email : data.email}
						]
					},
				});

				if (existedEmployee) {
					throw new BadRequestException(
						'Mã nhân viên hoặc email đã tồn tại. Hãy cập nhật lại thông tin',
					);
				}

				const password = await Bun.password.hash(data.password, {
					algorithm: 'bcrypt',
					cost: 10,
				});

				const employee = await tx.employee.create({
					data: {
						...data,
						password,
						active: true,
					},
				});

				await tx.userRole.create({
					data: {
						userId: employee.id,
						role: Role.EMPLOYEE,
					},
				});

				const department = await tx.department.findUnique({
					where: {
						id: employee.departmentId,
					},
					select: {
						name: true,
					},
				});

				const position = await tx.position.findUnique({
					where: {
						id: employee.positionId,
					},
					select: {
						name: true,
					},
				});

				return {
					employee,
					departmentName: department?.name || 'Chưa có thông tin',

					positionName: position?.name || 'Chưa có thông tin',
				};
			});

			// Send mail OUTSIDE transaction
			await this.emailService.sendWelcomeMail(
				result.employee.email,
				'[UTAHIMEBOOK] Thông báo cấp tài khoản nhân viên',
				'employee_register',
				{
					email: result.employee.email,

					name: result.employee.name,

					department: result.departmentName,

					position: result.positionName,

					phone: result.employee.phone,

					password: data.password,
				},
			);

			return result.employee;
		} catch (err) {
			console.log('create employee error', err);

			throw err;
		}
	}
	async getEmployeeByCode(code: string) {
		try {
			const responseData = await this.prismaService.employee.findFirst({
				where: { code },
				select: {
					id: true,
					code: true,
				},
			});
			if (!responseData)
				throw new BadRequestException('Employee Not Found');
			return responseData;
		} catch (err) {
			console.log('Find employee by code error: ', err);
			throw err;
		}
	}
	async getOptions() {
		return {
			status: Object.values(EmployeeStatus),
		};
	}
	async getDepartmentAndPositions() {
		const departments = await this.prismaService.department.findMany({
			select: {
				id: true,
				name: true,
			},
		});
		const positions = await this.prismaService.position.findMany({
			select: {
				id: true,
				name: true,
			},
		});
		return {
			departments,
			positions,
		};
	}
	async updateEmployeeAccount(id: number, data: UpdateEmployeeDto) {
		try {
			const result = await this.prismaService.$transaction(async (tx) => {
				if (data.password) {
					const hashPassword = await Bun.password.hash(
						data.password,
						{
							algorithm: 'bcrypt',
							cost: 10,
						},
					);
					data.password = hashPassword;
				}
				const employee = await tx.employee.update({
					where: { id },
					data: {
						...data,
					},
				});
				return employee;
			});
			if (result) {
				const departmentName =
					await this.prismaService.department.findFirst({
						where: {
							id: result.departmentId,
						},
						select: {
							name: true,
						},
					});
				const positionName =
					await this.prismaService.position.findFirst({
						where: {
							id: result.positionId,
						},
						select: {
							name: true,
						},
					});
				//Sending email to verify the update
				await this.emailService.sendWelcomeMail(
					result.email,
					'[UtahimeBook] Thông báo cập nhật tài khoản nhân viên',
					'employee_update',
					{
						email: result.email,
						name: result.name,
						phone: result.phone,
						department: departmentName?.name || '',
						position: positionName?.name || '',
					},
				);
			}
			return result;
		} catch (err) {
			console.log('update employee account error', err);
			throw err;
		}
	}

	async deleteAccount(id: number) {
		const res = await this.prismaService.employee.update({
			where: {
				id,
			},
			data: {
				deletedAt: new Date(Date.now()),
			},
		});
		return res;
	}
	async getAllEmployee() {
		try {
			const employees = await this.prismaService.employee.findMany({
				where: { deletedAt: null },
				select: {
					email: true,
					avatar: true,
					phone: true,
					name: true,
					status: true,
					id: true,
					code: true,
					resume: true,
					salary: true,
					createdAt: true,
					position: {
						select: {
							name: true,
						},
					},
					department: {
						select: {
							name: true,
						},
					},
				},
			});
			return employees;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getEmployeeById(id: number) {
		const employee = await this.prismaService.employee.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});
		return employee;
	}
	async verifyEmployeeAccount(token: string) {
		try {
			const verifySecretKey =
				this.configService.get<string>('VERIFY_SECRET_KEY');

			const payload = this.jwtService.verify(token, {
				secret: verifySecretKey,
			});
			if (payload[TokenBody.PURPOSE] !== TokenType.VERIFY_EMAIL)
				throw new BadRequestException('Invalid token purpose');
			const hashToken = hashSHA256(token);
			const storedToken = await this.prismaService.token.findFirst({
				where: {
					token: hashToken,
					type: TokenType.VERIFY_EMAIL,
					employeeId: payload[TokenBody.SUB],
					expiresAt: {
						gt: new Date(),
					},
				},
			});
			if (!storedToken)
				throw new BadRequestException('Token invalid or expired');
			await this.prismaService.employee.update({
				where: {
					id: payload[TokenBody.SUB],
				},
				data: {
					active: true,
				},
			});
			await this.prismaService.token.deleteMany({
				where: {
					employeeId: payload[TokenBody.SUB],
					type: TokenType.VERIFY_EMAIL,
				},
			});
			return {
				success: true,
				message: 'Email verified successfully',
			};
		} catch (err) {
			console.log('Verify Employee Error:', err);
			throw new BadRequestException(
				'Invalid or expired verification token',
			);
		}
	}
	async getEmployeeProfile(id: number) {
		try {
			const employee = await this.prismaService.employee.findFirst({
				where: {
					id,
				},
				select: {
					email: true,
					avatar: true,
					phone: true,
					id: true,
					salary: true,
					createdAt: true,
					status: true,
					name: true,
					code: true,
					position: {
						select: {
							name: true,
						},
					},
					department: {
						select: {
							name: true,
						},
					},
				},
			});
			if (!employee)
				throw new BadRequestException('Employee Profile Not Found');
			return employee;
		} catch (err) {
			console.log('Get Employee Profile Error: ', err);
			throw err;
		}
	}
	async updateEmployeeData() {
		//Update employee information
	}
	async deActiveEmployeeAccount() {
		//Set active in model to false -> In the billing account get all bill
	}
}
