import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import type { Request } from 'express';
import { Roles } from '@/bases/decorators/role.decorators';
import { Role } from '@prisma/client';
import { RolesGuard } from '@/bases/guards/role.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	@Get('verify')
	async verify(@Query('token') token: String) {
		console.log(token);
	}
	@Get('/test')
	async testingAuth() {
		return 'Get this to have rate limit';
	}
	@Post('login')
	@UseGuards(LocalAuthGuard)
	async login(@Req() req: Request) {
		const { email, password } = req.body;
		const user = req.user;
		const responseData = await this.authService.login(
			email,
			password,
			user,
		);
		return responseData;
	}
	@Post('testing')
	// @UseGuards(JwtAuthGuard)
	@Roles(Role.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard) //Run Guards in order. You can see it in the console.log
	async test() {
		return 'Testing successfully';
	}
	@UseGuards(JwtAuthGuard)
	@Get('logout')
	async logout(@Req() req: Request) {
		const user = req.user as any;

		if (user) {
			console.log(user);
			const id = user.id;
			const roles = user.roles;
			const responseData = await this.authService.logout(id, roles);
			return responseData;
		}
		return {
			message: 'Logout failed',
		};
	}
	@UseGuards(JwtAuthGuard)
	@Get('me')
	async me(@Req() req: Request) {
		const user = req.user as any;
		console.log(user);
		if (user) {
			const { id } = user;
			const me = await this.authService.getMe(Number(id));
			return me;
		}
		return {
			errCode: 1,
			message: 'Cannot get information',
		}; //Tra ve thong tin co ban cho ben nguoi dung
	}
	@UseGuards(JwtAuthGuard)
	@Post('reset-password')
	// async resetPassword(@Req() req: Request) {}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	async getProfile(@Req() req: Request) {
		const user = req.user as any;
		console.log(user) 
		const { id } = user;
		const responseData = await this.authService.getMyProfile(
			Number(id),
		);
		return responseData;
	}
}
/* Jwt Payload 
  purpose: "ACCESS",
  email: "nguyenkhaan2006@gmail.com",
  roles: [ "EMPLOYEE" ],
*/
