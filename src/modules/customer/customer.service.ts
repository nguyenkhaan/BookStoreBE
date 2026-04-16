import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MemberGrade } from '@prisma/client';
import { UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
	constructor(private readonly prismaService: PrismaService) {}

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
			return data.map((item) => ({
				...item,
				totalPaid: Number(item.totalPaid),
			}));
		} catch (err) {
			console.log(err);
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
			if (!ans) throw new BadRequestException('Customer Not Found');
			return ans;
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
                gold : gold._count.code, 
                silver : silver._count.code, 
                bronze : bronze._count.code 
            }
		} catch (err) {
            console.log("Get customer statistic error: " , err) 
            throw err 
        }
	}
	async findCustomerById(id : number) 
	{
		const customer = await this.prismaService.customer.findFirst({
			where: { id }
		}) 
		return customer 
	}
	async deleteCustomerById(id : number) 
	{
		try 
		{
			const result = await this.prismaService.customer.update({
				where: { id }, 
				data: {
					deletedAt : new Date(Date.now())
				}
			})
			return result
		} 
		catch (err) {
			console.log(err) 

		}
	}
	async updateCustomerById(id : number , data : UpdateCustomerDto) 
	{
		try 
		{
			const customer = await this.findCustomerById(id) 
			if (!customer) 
				throw new BadRequestException("customer not found") 
			const result = await this.prismaService.customer.update({
				where: { id }, 
				data: {
					...data 
				}
			})
			return result
		} 
		catch (err) 
		{
			console.log(err) 
			throw err 
		}
	}
}
