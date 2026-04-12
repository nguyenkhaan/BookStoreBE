import { TokenBody } from '@/bases/commons/enums/token.enum';
import { PrismaService } from '@/prisma/prisma.service';
import { hashSHA256 } from '@/utlitis/sha256';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '@prisma/client';
import { UpdateEmployeeInformation } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}
	async getAllEmployee() {
		try {
			const employees = await this.prismaService.employee.findMany({
				select: {
					email: true,
					avatar: true,
					phone: true,
					id: true,
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
	async updateEmployeeData(id: number, dto: UpdateEmployeeInformation) {
		try {
			const employee = await this.prismaService.employee.findFirst({
				where: { id },
			});
			if (!employee) throw new BadRequestException('Employee not found');

			const updatedEmployee = await this.prismaService.employee.update({
				where: { id },
				data: {
					...dto,
				},
				select: {
					email: true,
					avatar: true,
					phone: true,
					id: true,
					code: true,
					name: true,
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
			return updatedEmployee;
		} catch (err) {
			console.log('Update Employee Error: ', err);
			throw err;
		}
	}
	async deActiveEmployeeAccount() {
		//Set active in model to false -> In the billing account get all bill
	}
}
