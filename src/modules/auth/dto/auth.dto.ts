import { EmployeeStatus } from '@prisma/client';
import {
	IsEmail,
	IsString,
	IsNotEmpty,
	Matches,
	IsEnum,
	IsNumber,
} from 'class-validator';
export class RegisterData {
	@IsNotEmpty()
	@IsEmail()
	email: string;
	@IsNotEmpty()
	@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/, {
		message:
			'Password phải chứa ít nhất 5 kí tự, bao gồm cả chữ cái và chữ số',
	})
	password: string;
	@IsString()
	@Matches(/^\d{10,11}$/, {
		message: 'Số điện thoại chỉ bao gồm 10 - 11 chữ số',
	})
	phone: string;
	@IsString()
	name: string;
	@IsEnum(EmployeeStatus, {
		message: 'Trạng thái làm việc không hợp lệ',
	})
	status: EmployeeStatus;
	@IsNumber()
	@IsNotEmpty()
	departmentId: number;
	@IsNumber()
	@IsNotEmpty()
	positionId: number;
}
export class LoginData {
	@IsEmail()
	@IsNotEmpty()
	email: string;
	@IsString()
	@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
		message: 'Password phải có ít nhất 6 ký tự và chứa cả chữ và số',
	})
	password: string;
}

export class ResetPassword {
	@IsString({
		message: 'Mật khẩu hiện tại phải đúng định dạng ',
	})
	@IsNotEmpty({
		message: 'Mật khẩu hiện tại không được để trống,',
	})
	currentPassword: string;
	@IsString({
		message: 'Mật khẩu hiện tại phải đúng định dạng ',
	})
	@IsNotEmpty({
		message: 'Mật khẩu mới không được để trống, ',
	})
	@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
		message: 'Password phải có ít nhất 5 ký tự và chứa cả chữ và số ',
	})
	password: string;
}
