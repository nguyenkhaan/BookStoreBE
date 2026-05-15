import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MemberGrade } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
	constructor(private readonly prismaService: PrismaService) {}

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
                    COALESCE(SUM(bi.cost), 0) as totalPaid
                FROM "Customer" c
                LEFT JOIN "Bill" b ON b."customerId" = c.id
                LEFT JOIN "BillIncome" bi 
                    ON bi."billId" = b.id 
                    AND bi."deletedAt" IS NULL
                WHERE c."deletedAt" IS NULL
                GROUP BY c.id
                ORDER BY totalPaid DESC
            `;

			// Convert Decimal string -> number (nếu cần)
			return data.map((item) => {
				const formatted = this.formatCustomerDisplay(item);
				return {
					...formatted,
					totalPaid: Number(item.totalPaid),
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async createCustomer(data: CreateCustomerDto) {
		try {
			const existingByPhone =
				await this.prismaService.customer.findUnique({
					where: { phone: data.phone },
				});
			if (existingByPhone && existingByPhone.deletedAt !== null)
				throw new BadRequestException(
					'Số điện thoại này không thể sử dụng',
				);

			if (existingByPhone && existingByPhone.active)
				throw new BadRequestException(
					'Khách hàng đã đăng ký tài khoản',
				);

			if (existingByPhone && !existingByPhone.active) {
				const upgradedCustomer =
					await this.prismaService.customer.update({
						where: { id: existingByPhone.id },
						data: {
							...data,
							active: true,
						},
					});
				return this.formatCustomerDisplay(upgradedCustomer);
			}

			const createdCustomer = await this.prismaService.customer.create({
				data: {
					...data,
					active: true,
				},
			});
			return this.formatCustomerDisplay(createdCustomer);
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

			const password = await Bun.password.hash('default');
			const sCustomer = await this.prismaService.customer.create({
				data: {
					name: 'Khách vãng lai',
					phone,
					active: false,
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
			if (!customer)
				throw new BadRequestException('Không tìm thấy khách hàng');
			const result = await this.prismaService.customer.update({
				where: { id },
				data: {
					...data,
				},
			});
			return result;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
}
