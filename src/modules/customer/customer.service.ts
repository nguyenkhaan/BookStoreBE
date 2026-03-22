import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

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
                FROM Customer c
                LEFT JOIN Bill b ON b.customerId = c.id
                LEFT JOIN BillIncome bi 
                    ON bi.billId = b.id 
                    AND bi.deletedAt IS NULL
                WHERE c.deletedAt IS NULL
                GROUP BY c.id
                ORDER BY totalPaid DESC
            `;

            // Convert Decimal string -> number (nếu cần)
            return data.map(item => ({
                ...item,
                totalPaid: Number(item.totalPaid),
            }));
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}