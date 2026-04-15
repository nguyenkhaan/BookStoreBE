import { PrismaService } from '@/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Role, TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBody } from '@/bases/commons/enums/token.enum';
import {
	ACCESS_LIVE_TIME,
	REFRESH_LIVE_TIME,
} from '@/bases/commons/constants/jwt.constant';
import { hashSHA256 } from '@/utlitis/sha256';

@Injectable()
export class AuthService {
	//this is the simple Authentication. You can config it to suitable for your job
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}
	async validateUser(email: string, password: string) {
		try {
			const user = await this.prismaService.employee.findFirst({
				where: {
					email,
				},
			});
			if (!user)
				throw new UnauthorizedException(
					'Employee has not been registered',
				);
			const results = await Bun.password.verify(password, user.password);

			if (results) return user;
			return null;
		} catch (err) {
			console.log('Valdating User Error: ', err);
			throw err;
		}
	}
	async getMe(id : number) 
	{
		try  
		{
			const employee = await this.prismaService.employee.findFirst({
				where: { id }, 
				select: {
					email : true, 
					name : true, 
					code: true,  
					id : true 
				}
			})
			if (!employee) 
				throw new BadRequestException("employee not found") 
			const userRoles = await this.prismaService.userRole.findMany({
				where: {
					userId : employee.id
				}, 
				select: {
					role : true 
				}
			})
			return {
				...employee, 
				roles: userRoles.map((role) => role.role)
			}
		} 
		catch (err) 
		{
			console.log("get me error" , err) 
			throw err 
		}

	}

	async login(email: string, password: string, user: any) {
		try {
			console.log('Login: ', email);
			const result = await Bun.password.verify(password, user.password);
			if (!result) throw new BadRequestException('Wrong Password');
			const roles = await this.prismaService.userRole.findMany({
				where: {
					userId: user.id,
				},
				select: {
					role: true,
				},
			});
			const userRoles = roles.map((roleO) => roleO.role);
			if (!roles) throw new BadRequestException("Don't have roles");
			const accessSecretKey =
				this.configService.get<string>('ACCESS_SECRET_KEY');
			const refreshSecretKey =
				this.configService.get<string>('REFRESH_SECRET_KEY');
			const payload = {
				[TokenBody.EMAIL]: user.email,
				[TokenBody.SUB]: user.id,
				[TokenBody.ROLES]: userRoles,
			};
			const accessToken = this.jwtService.sign(
				{
					...payload,
					[TokenBody.PURPOSE]: TokenType.ACCESS,
				},
				{
					expiresIn: ACCESS_LIVE_TIME,
					secret: accessSecretKey,
				},
			);
			const refreshToken = this.jwtService.sign(
				{
					...payload,
					[TokenBody.PURPOSE]: TokenType.REFRESH,
				},
				{
					expiresIn: REFRESH_LIVE_TIME,
					secret: refreshSecretKey,
				},
			);
			//Store token into table
			await this.prismaService.token.deleteMany({
				where: {
					employeeId: user.id,
					type: {
						in: [TokenType.ACCESS, TokenType.REFRESH],
					},
				},
			});
			// const hashAccessToken = hashSHA256(accessToken)
			const hashRefreshToken = hashSHA256(refreshToken);
			/*  -- Don't store access token 
            await this.prismaService.token.create({
                data: {
                    token : hashAccessToken, 
                    type: TokenType.ACCESS, 
                    employeeId: user.id, 
                    expiresAt: new Date(Date.now() + 1000 * ACCESS_LIVE_TIME)
                }
            })
                */
			await this.prismaService.token.create({
				data: {
					token: hashRefreshToken,
					type: TokenType.REFRESH,
					employeeId: user.id,
					expiresAt: new Date(Date.now() + 1000 * REFRESH_LIVE_TIME),
				},
			});

			return {
				id: user.id,
				email: user.email,
				accessToken,
				refreshToken,
			};
		} catch (err) {
			console.log('Login Error: ', err);
			throw err;
		}
	}
	async logout(userId: number, roles: Role[]) {
		try {
			if (roles.includes(Role.EMPLOYEE) || roles.includes(Role.ADMIN)) {
				await this.prismaService.token.deleteMany({
					where: {
						employeeId: userId,
						type: {
							in: [TokenType.ACCESS, TokenType.REFRESH],
						},
					},
				});
			} else {
				await this.prismaService.token.deleteMany({
					where: {
						customerId: userId,
						type: {
							in: [TokenType.ACCESS, TokenType.REFRESH],
						},
					},
				});
			}
			return {
				message: 'Logout successfully',
			};
		} catch (err) {
			console.log('Loutout Error: ', err);
			throw err;
		}
	}
}
