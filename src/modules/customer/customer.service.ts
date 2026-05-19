import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MemberGrade } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { generateRandomPassword } from '@/utlitis/randomPassword';

@Injectable()
export class CustomerService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly emailService: EmailService,
	) {}

	private readonly customerMissingInfo = 'Chưa có thông tin';


	private formatCustomerDisplay<
		T extends {
			active?: boolean | null;
			name?: string | null;
			email?: string | null;
			code?: string | null;
		},
	>(customer: T): T & { name: string; email: string; code: string } {
		const isGuest = customer.active === false;
		return {
			...customer,
			name: customer.name ?? this.customerMissingInfo,
			email:
				isGuest || !customer.email
					? this.customerMissingInfo
					: customer.email,
			code:
				isGuest || !customer.code
					? this.customerMissingInfo
					: customer.code,
		};
	}

	async getCustomersWithTotalPaid() {
		try {
			const data = await this.prismaService.$queryRaw<
				{
					id: number;
					code: string;
					name: string;
					email: string;
					phone: string;
					grade: string;
					totalBills: string; 
					totalPaid: string; // Decimal trả về string
				}[]
			>`
                SELECT 
                    c.id,
                    c.code,
                    c.name,
                    c.email,
                    c.phone,
                    c.grade,
                    COALESCE(SUM(bi.cost), 0) as "totalPaid", 
					COUNT(DISTINCT b.id) as "totalBills"
                FROM "Customer" c
                LEFT JOIN "Bill" b ON b."customerId" = c.id
                LEFT JOIN "BillIncome" bi 
                    ON bi."billId" = b.id 
                    AND bi."deletedAt" IS NULL
                WHERE c."deletedAt" IS NULL
                GROUP BY c.id
                ORDER BY "totalPaid" DESC
            `;

			// Convert Decimal string -> number (nếu cần)
			return data.map((item) => {
				const formatted = this.formatCustomerDisplay(item);
				console.log(formatted) 
				return {
					...formatted,
					totalPaid: Number(item.totalPaid),
					totalBills: Number(item.totalBills) 
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async createCustomerCode() {
		//Using for auto generating bill code
		const latest = await this.prismaService.customer.findFirst({
			where: {
				code: {
					not: null,
					contains: 'KH',
				},
			},
			orderBy: {
				id: 'desc',
			},
			select: {
				code: true,
			},
		});
		if (!latest || !latest.code) return `KH001`;
		return (
			'KH' +
			(Number(latest.code?.replace('KH', '')) + 1)
				.toString()
				.padStart(3, '0')
		);
	}
	async createCustomer(data: CreateCustomerDto) {
		try {
			const existingByPhone =
				await this.prismaService.customer.findUnique({
					where: { phone: data.phone },
				});
			const existingByEmail =
				await this.prismaService.customer.findUnique({
					where: { email: data.email },
				});
			if (existingByEmail)
				throw new ConflictException(
					'Email đã được sử dụng với một tài khoản khác',
				);
			if (existingByPhone && existingByPhone.code)
				throw new BadRequestException(
					'Khách hàng đã đăng ký tài khoản',
				);
			const code = await this.createCustomerCode();
			const password = generateRandomPassword();
			const hashedPassword = await Bun.password.hash(password, {
				algorithm: 'bcrypt',
				cost: 10,
			});

			//Nang cap tai khoan vang lai thanh tai khoan chinh thuc
			let customer = null;
			if (existingByPhone && !existingByPhone.code) {
				customer = await this.prismaService.customer.update({
					where: { id: existingByPhone.id },
					data: {
						...data,
						code,
						password: hashedPassword,
					},
				});
			}
			// Tao luon mot tai khoan moi
			else {
				customer = await this.prismaService.customer.create({
					data: {
						...data,
						code,
						password: hashedPassword,
					},
				});
			}
			//Send email to de verify tai khoan
			await this.emailService.sendWelcomeMail(
				data.email,
				'[Betabook] Thông tin tài khoản khách hàng',
				'customer_register',
				{
					email: data.email,
					password,
					phone: customer.phone,
				},
			);
			return this.formatCustomerDisplay(customer);
		} catch (err) {
			console.log('Create customer error');
			throw err;
		}
	}
	//Tạo tài khoản cho khách vãng lai
	async createStrangeCustomer(phone: string) {
		try {
			const customer = await this.prismaService.customer.findUnique({
				where: { phone },
			});
			if (customer) return customer;
			const uPass = uuidv4();
			const password = await Bun.password.hash(uPass);
			const sCustomer = await this.prismaService.customer.create({
				data: {
					name: 'Khách vãng lai',
					phone,
					password,
					code: null,
					email: null,
				},
			});
			return sCustomer;
		} catch (err) {
			console.log('Create strange customer error', err);
			throw err;
		}
	}
	async getCustomerByPhone(phone: string) {
		try {
			const ans = await this.prismaService.customer.findFirst({
				where: {
					phone: {
						contains: phone,
						mode: 'insensitive',
					},
				},
			});
			if (!ans)
				throw new BadRequestException('Không tìm thấy khách hàng');
			return this.formatCustomerDisplay(ans);
		} catch (err) {
			console.log('Find customer by phone: ', err);
			throw err;
		}
	}
	async getGeneralStatistic() {
		try {
			const dinamond = await this.prismaService.customer.aggregate({
				_count: { code: true },
				where: {
					deletedAt: null,
					grade: MemberGrade.DIAMOND,
				},
			});
			const silver = await this.prismaService.customer.aggregate({
				_count: { code: true },
				where: {
					deletedAt: null,
					grade: MemberGrade.SILVER,
				},
			});
			const bronze = await this.prismaService.customer.aggregate({
				_count: { code: true },
				where: {
					deletedAt: null,
					grade: MemberGrade.BRONZE,
				},
			});
			const gold = await this.prismaService.customer.aggregate({
				_count: { code: true },
				where: {
					deletedAt: null,
					grade: MemberGrade.GOLD,
				},
			});
			return {
				dinamond: dinamond._count.code,
				gold: gold._count.code,
				silver: silver._count.code,
				bronze: bronze._count.code,
			};
		} catch (err) {
			console.log('Get customer statistic error: ', err);
			throw err;
		}
	}
	async findCustomerById(id: number) {
		const customer = await this.prismaService.customer.findFirst({
			where: { id },
		});
		return customer;
	}
	async deleteCustomerById(id: number) {
		try {
			const result = await this.prismaService.customer.update({
				where: { id },
				data: {
					deletedAt: new Date(Date.now()),
				},
			});
			return result;
		} catch (err) {
			console.log(err);
		}
	}
	async updateCustomerById(id: number, data: UpdateCustomerDto) {
		try {
			const customer = await this.findCustomerById(id);
			if (!customer || !customer.email)
				throw new BadRequestException(
					'Không tìm thấy khách hàng. Vui lòng đăng ký tài khoản trước khi sử dụng dịch vụ',
				);
			const result = await this.prismaService.customer.update({
				where: { id },
				data: {
					...data,
				},
			});
			//Sau khi update xong thi gui email ve
			const mappedGrade = this.emailService.gradeMapping(customer.grade);
			await this.emailService.sendWelcomeMail(
				customer.email,
				'Thông báo cập nhật tài khoản',
				'customer_update',
				{
					name: customer.name,
					email: customer.email,
					phone: customer.phone || '',
					gradeText: mappedGrade.text,
					gradeColor: mappedGrade.color,
				},
			);
			return result;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
}
