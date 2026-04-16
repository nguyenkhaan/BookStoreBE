import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClient = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedingCustomerData() {
	await prismaClient.customer.createMany({
		data: [
			{
				code: 'KH001',
				name: 'Nguyen Van An',
				email: 'an.nguyen@example.com',
				phone: '0901234567',
				password: 'hashed_password_1',
				active: true,
				grade: 'SILVER',
			},
			{
				code: 'KH002',
				name: 'Tran Thi Bich',
				email: 'bich.tran@example.com',
				phone: '0912345678',
				password: 'hashed_password_2',
				active: true,
				grade: 'GOLD',
			},
			{
				code: 'KH003',
				name: 'Le Hoang Minh',
				email: 'minh.le@example.com',
				phone: '0923456789',
				password: 'hashed_password_3',
				active: false,
				grade: 'BRONZE',
			},
			{
				code: 'KH004',
				name: 'Pham Quoc Bao',
				email: 'bao.pham@example.com',
				phone: '0934567890',
				password: 'hashed_password_4',
				active: true,
				grade: 'DIAMOND',
			},
			{
				code: 'KH005',
				name: 'Vo Thi Lan',
				email: 'lan.vo@example.com',
				phone: '0945678901',
				password: 'hashed_password_5',
				active: false,
				grade: 'SILVER',
			},
		],
	});
    console.log("Seeded customer data") 
}

async function seedingRules() {
	await prismaClient.rule.createMany({
		data: [
			{
				title: 'Employee Attendance Policy',
				content:
					'Employees must check in before 9:00 AM. Late arrivals beyond 3 times per month will be reviewed.',
				shortDescription:
					'Rules for employee attendance and punctuality.',
				type: 'HUMAN',
				status: 'APPLYING',
				creatorId: 1,
				appliedAt: new Date('2025-01-01'),
			},
			{
				title: 'Discount Policy for Members',
				content:
					'Gold and Diamond members receive 10% and 15% discounts respectively on all purchases.',
				shortDescription: 'Discount rules based on membership grade.',
				type: 'SALE',
				status: 'APPLYING',
				creatorId: 1,
				appliedAt: new Date('2025-02-01'),
			},
			{
				title: 'Warehouse Management Regulation',
				content:
					'All goods must be checked and recorded before being stored in the warehouse.',
				shortDescription: 'Guidelines for warehouse operations.',
				type: 'LOGISTIC',
				status: 'UPCOMING',
				creatorId: 1,
				appliedAt: new Date('2025-05-01'),
			},
			{
				title: 'Customer Service Standard',
				content:
					'All customers must be greeted within 30 seconds of entering the store.',
				shortDescription: 'Service quality expectations for employees.',
				type: 'SERVICE',
				status: 'APPLYING',
				creatorId: 1,
				appliedAt: new Date('2025-03-01'),
			},
			{
				title: 'Financial Approval Process',
				content:
					'All expenses above 10,000,000 VND require manager approval.',
				shortDescription: 'Rules for approving financial transactions.',
				type: 'FINANCE',
				status: 'UPCOMING',
				creatorId: 1,
				appliedAt: new Date('2025-01-15'),
			},
			{
				title: 'Workplace Safety Regulation',
				content:
					'Employees must wear safety equipment in designated areas at all times.',
				shortDescription: 'Safety requirements in the workplace.',
				type: 'SAFETY',
				status: 'REJECT',
				creatorId: 1,
				appliedAt: new Date('2024-12-01'),
			},
		],
	});
    console.log("Seeded rule data:")
}

async function seeder() {
	try {
		await seedingRules();
		await seedingCustomerData()
		console.log('Seeding completed');
	} catch (error) {
		console.error(error);
	} finally {
		await prismaClient.$disconnect();
	}
}

seeder() 