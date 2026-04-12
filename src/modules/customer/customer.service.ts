import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCustomerData, UpdateCustomerData } from './dto/customer.dto';
import { MemberGrade } from '@prisma/client';

@Injectable()
export class CustomerService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllCustomers() {
        const customers = await this.prismaService.customer.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                bill: true,
            },
        });

        return customers.map(customer => {
            const totalPaid = customer.bill
                .filter(b => b.status === 'COMPLETE')
                .reduce((sum, b) => sum + Number(b.total), 0);
            
            return {
                ...customer,
                totalPaid,
            };
        });
    }

    async getCustomerById(id: number) {
        const customer = await this.prismaService.customer.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async getCustomerByPhone(phone: string) {
        const customer = await this.prismaService.customer.findFirst({
            where: {
                phone,
                deletedAt: null,
            },
        });

        if (!customer) throw new NotFoundException('Customer with this phone not found');
        return customer;
    }

    async createCustomer(data: CreateCustomerData) {
        const existing = await this.prismaService.customer.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { phone: data.phone },
                    { code: data.code },
                ],
            },
        });

        if (existing) throw new BadRequestException('Customer with this email, phone, or code already exists');

        const hashedPassword = await Bun.password.hash(data.password);

        return this.prismaService.customer.create({
            data: {
                ...data,
                password: hashedPassword,
                grade: data.grade || MemberGrade.BRONZE,
            },
        });
    }

    async updateCustomer(id: number, data: UpdateCustomerData) {
        const customer = await this.getCustomerById(id);

        return this.prismaService.customer.update({
            where: { id: customer.id },
            data,
        });
    }

    async deleteCustomer(id: number) {
        const customer = await this.getCustomerById(id);

        return this.prismaService.customer.update({
            where: { id: customer.id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async getStatistic() {
        const totalCustomers = await this.prismaService.customer.count({
            where: { deletedAt: null },
        });

        const customers = await this.prismaService.customer.findMany({
            where: { deletedAt: null },
            include: { bill: true },
        });

        const activeCustomers = customers.filter(c => c.active).length;
        
        const gradeDistribution = {
            BRONZE: customers.filter(c => c.grade === MemberGrade.BRONZE).length,
            SILVER: customers.filter(c => c.grade === MemberGrade.SILVER).length,
            GOLD: customers.filter(c => c.grade === MemberGrade.GOLD).length,
            DIAMOND: customers.filter(c => c.grade === MemberGrade.DIAMOND).length,
        };

        return {
            totalCustomers,
            activeCustomers,
            gradeDistribution,
        };
    }
}
