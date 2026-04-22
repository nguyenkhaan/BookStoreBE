import {
	EmployeeStatus,
	PrismaClient,
	Role,
	BookCategory,
	BillStatus,
	RuleStatus,
	RuleType,
	MemberGrade,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClient = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function departmentSeeder() {
	const DEPARTMENT_LISTS = [
		{ name: 'Resource Department' },
		{ name: 'Technical Department' },
		{ name: 'Baking Department' },
		{ name: 'Booking Department' },
		{ name: 'Cooking Department' },
	];

	await prismaClient.department.createMany({
		data: DEPARTMENT_LISTS,
		skipDuplicates: true,
	});

	console.log('Seeding Department Successfully');
}

async function positionSeeder() {
	const POSITION_LISTS = [
		{ name: 'Tech Lead', departmentId: 1 },
		{ name: 'HR', departmentId: 2 },
		{ name: 'Employee', departmentId: 3 },
		{ name: 'Architecture', departmentId: 4 },
		{ name: 'BA', departmentId: 5 },
	];

	await prismaClient.position.createMany({
		data: POSITION_LISTS,
		skipDuplicates: true,
	});

	console.log('Seeding Position Successfully');
}

async function publisherSeeder() {
	const publishers = [
		{ name: 'NXB Kim Dong' },
		{ name: 'NXB Kim Tien' },
		{ name: 'NXB Kim Manh' },
		{ name: 'NXB Kim Dung' },
		{ name: 'NXB Ninh Ha' },
	];

	await prismaClient.publisher.createMany({
		data: publishers,
		skipDuplicates: true,
	});

	console.log('Seeding Publisher Successfully');
}

async function authorSeeder() {
	const authors = [
		{ code: 'AUTHOR001', name: 'Na Tra' },
		{ code: 'AUTHOR002', name: 'Ly Tinh' },
		{ code: 'AUTHOR003', name: 'Ton Ngo Khong' },
		{ code: 'AUTHOR004', name: 'Duong Tien' },
		{ code: 'AUTHOR005', name: 'Hao Thien Khuyen' },
	];

	await prismaClient.author.createMany({
		data: authors,
		skipDuplicates: true,
	});

	console.log('Seeding Author Successfully');
}

async function bookSeeder() {
	const books = [
		{
			code: 'BOOK001',
			title: 'Journey to the West',
			cost: 100,
			year: 2020,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK002',
			title: 'Heavenly War',
			cost: 150,
			year: 2021,
			category: BookCategory.THIEU_NHI,
		},
	];

	await prismaClient.book.createMany({
		data: books,
		skipDuplicates: true,
	});

	console.log('Seeding Book Successfully');

	// Get data for relations
	const allBooks = await prismaClient.book.findMany();
	const allAuthors = await prismaClient.author.findMany();
	const allPublishers = await prismaClient.publisher.findMany();

	// AuthorBook relations
	const authorBooks = allBooks.map((book, index) => ({
		bookId: book.id,
		authorId: allAuthors[index % allAuthors.length].id,
	}));

	await prismaClient.authorBook.createMany({
		data: authorBooks,
		skipDuplicates: true,
	});

	// PublisherBook relations
	const publisherBooks = allBooks.map((book, index) => ({
		bookId: book.id,
		publisherId: allPublishers[index % allPublishers.length].id,
	}));

	await prismaClient.publisherBook.createMany({
		data: publisherBooks,
		skipDuplicates: true,
	});

	// Inventory
	const inventories = allBooks.map((book) => ({
		bookId: book.id,
		stock: 100,
	}));

	await prismaClient.inventory.createMany({
		data: inventories,
		skipDuplicates: true,
	});

	console.log('Seeding Relations & Inventory Successfully');
}

async function adminSeeder() {
	const ADMIN_EMAIL = 'admin@gmail.com';
	const ADMIN_PASSWORD = 'admin';

	const hashPassword = await Bun.password.hash(ADMIN_PASSWORD, {
		algorithm: 'bcrypt',
		cost: 10,
	});

	const department = await prismaClient.department.findFirst({
		where: { name: 'Technical Department' },
	});

	const position = await prismaClient.position.findFirst({
		where: { name: 'Tech Lead' },
	});

	const admin = await prismaClient.employee.upsert({
		where: { email: ADMIN_EMAIL },
		update: {},
		create: {
			email: ADMIN_EMAIL,
			password: hashPassword,
			code: 'NV000',
			name: 'Admin',
			departmentId: department!.id,
			positionId: position!.id,
			phone: '081829292',
			status: EmployeeStatus.WORKING,
			active: true,
			salary: 1000,
		},
	});

	await prismaClient.userRole.createMany({
		data: [
			{ userId: admin.id, role: Role.ADMIN },
			{ userId: admin.id, role: Role.EMPLOYEE },
		],
		skipDuplicates: true,
	});

	console.log('Admin created:', admin.email);
}
//Employee Seeder
async function employeeSeeder() {
	const DEFAULT_PASSWORD = '123456';

	const hashedPassword = await Bun.password.hash(DEFAULT_PASSWORD, {
		algorithm: 'bcrypt',
		cost: 10,
	});

	const departments = await prismaClient.department.findMany();
	const positions = await prismaClient.position.findMany();

	const employees = [
		{
			code: 'NV001',
			email: 'employee1@gmail.com',
			phone: '0900000001',
			name: 'Nguyen Van A',
			departmentId: departments[0].id,
			positionId: positions[0].id,
			status: EmployeeStatus.WORKING,
			active: true,
			salary: 1200,
		},
		{
			code: 'NV002',
			email: 'employee2@gmail.com',
			phone: '0900000002',
			name: 'Tran Thi B',
			departmentId: departments[1].id,
			positionId: positions[1].id,
			status: EmployeeStatus.WORKING,
			active: true,
			salary: 1500,
		},
		{
			code: 'NV003',
			email: 'employee3@gmail.com',
			phone: '0900000003',
			name: 'Le Van C',
			departmentId: departments[2].id,
			positionId: positions[2].id,
			status: EmployeeStatus.RETIRED,
			active: false,
			salary: 1000,
		},
	];

	await prismaClient.employee.createMany({
		data: employees.map((emp) => ({
			...emp,
			password: hashedPassword,  
		})),
		skipDuplicates: true,
	});

	console.log('Seeding Employees Successfully');
}
async function employeeRoleSeeder() {
	const employees = await prismaClient.employee.findMany();

	const roles = employees.map((emp) => ({
		userId: emp.id,
		role: Role.EMPLOYEE,
	}));

	await prismaClient.userRole.createMany({
		data: roles,
		skipDuplicates: true, // ✅ tránh duplicate nếu đã có
	});

	console.log('Seeding UserRole EMPLOYEE Successfully');
}

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
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH002',
				name: 'Tran Thi Bich',
				email: 'bich.tran@example.com',
				phone: '0912345678',
				password: 'hashed_password_2',
				active: true,
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH003',
				name: 'Le Hoang Minh',
				email: 'minh.le@example.com',
				phone: '0923456789',
				password: 'hashed_password_3',
				active: false,
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH004',
				name: 'Pham Quoc Bao',
				email: 'bao.pham@example.com',
				phone: '0934567890',
				password: 'hashed_password_4',
				active: true,
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH005',
				name: 'Vo Thi Lan',
				email: 'lan.vo@example.com',
				phone: '0945678901',
				password: 'hashed_password_5',
				active: false,
				grade: MemberGrade.SILVER,
			},
		],
	});
	console.log('Seeded customer data');
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
				type: RuleType.HUMAN,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-01-01'),
			},
			{
				title: 'Discount Policy for Members',
				content:
					'Gold and Diamond members receive 10% and 15% discounts respectively on all purchases.',
				shortDescription: 'Discount rules based on membership grade.',
				type: RuleType.SALE,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-02-01'),
			},
			{
				title: 'Warehouse Management Regulation',
				content:
					'All goods must be checked and recorded before being stored in the warehouse.',
				shortDescription: 'Guidelines for warehouse operations.',
				type: RuleType.LOGISTIC,
				status: RuleStatus.UPCOMING,
				creatorId: 1,
				appliedAt: new Date('2025-05-01'),
			},
			{
				title: 'Customer Service Standard',
				content:
					'All customers must be greeted within 30 seconds of entering the store.',
				shortDescription: 'Service quality expectations for employees.',
				type: RuleType.SERVICE,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-03-01'),
			},
			{
				title: 'Financial Approval Process',
				content:
					'All expenses above 10,000,000 VND require manager approval.',
				shortDescription: 'Rules for approving financial transactions.',
				type: RuleType.FINANCE,
				status: RuleStatus.UPCOMING,
				creatorId: 1,
				appliedAt: new Date('2025-01-15'),
			},
			{
				title: 'Workplace Safety Regulation',
				content:
					'Employees must wear safety equipment in designated areas at all times.',
				shortDescription: 'Safety requirements in the workplace.',
				type: RuleType.SAFETY,
				status: RuleStatus.REJECT,
				creatorId: 1,
				appliedAt: new Date('2024-12-01'),
			},
		],
	});
	console.log('Seeded rule data:');
}

async function voucherSeeder() {
	await prismaClient.voucher.createMany({
		data: [
			{
				name: "DISCOUNT_10_PERCENT",
				code: "VC10",
				eventName: "Summer Sale 10%",
				sale: 10,
				status: "APPLYING",
				usedNumber: 0,
				quantity: 100,
				expiresAt: new Date("2026-12-31"),
				startDate: new Date("2026-01-01"),
				type: "PERCENT",
				description: "Giảm 10% toàn bộ đơn hàng",
			},
			{
				name: "DISCOUNT_20_PERCENT",
				code: "VC20",
				eventName: "Big Sale 20%",
				sale: 20,
				status: "APPLYING",
				usedNumber: 0,
				quantity: 50,
				expiresAt: new Date("2026-12-31"),
				startDate: new Date("2026-01-01"),
				type: "PERCENT",
				description: "Giảm 20% đơn hàng lớn",
			},
			{
				name: "WELCOME_50K",
				code: "VC50K",
				eventName: "Welcome New Customer",
				sale: 50000,
				status: "UPCOMING",
				usedNumber: 0,
				quantity: 200,
				expiresAt: new Date("2026-06-30"),
				startDate: new Date("2026-05-01"),
				type: "VND",
				description: "Giảm 50k cho khách hàng mới",
			},
			{
				name: "EXPIRED_TEST",
				code: "VCOLD",
				eventName: "Old Campaign",
				sale: 15,
				status: "ENDED",
				usedNumber: 10,
				quantity: 10,
				expiresAt: new Date("2025-01-01"),
				startDate: new Date("2024-01-01"),
				type: "PERCENT",
				description: "Voucher đã hết hạn",
			},
		],
		skipDuplicates: true,
	});

	console.log("Seeded Voucher Successfully");
}

async function billIncomeOutcomeSeeder() {
	const customers = await prismaClient.customer.findMany();
	const books = await prismaClient.book.findMany();
	const employees = await prismaClient.employee.findMany();
	const vouchers = await prismaClient.voucher.findMany();
	const publishers = await prismaClient.publisher.findMany();

	if (!customers.length || !books.length || !employees.length) {
		throw new Error("Missing required seed data");
	}

	// =========================
	// 1. CREATE 6 BILLS
	// =========================
	const bills = [];

	for (let i = 0; i < 6; i++) {
		const bill = await prismaClient.bill.create({
			data: {
				code: `BILL00${i + 1}`,
				customerId: customers[i % customers.length].id,
				status: BillStatus.COMPLETE,
				cost: 0,

				billDetail: {
					create: [
						{
							bookId: books[i % books.length].id,
							quantity: 1 + i,
						},
						{
							bookId: books[(i + 1) % books.length].id,
							quantity: 2,
						},
					],
				},
			},
		});

		bills.push(bill);
	}

	console.log("Created 6 Bills");

	// =========================
	// 2. 3 BILLS USE VOUCHER
	// =========================
	for (let i = 0; i < 3; i++) {
		const voucher = vouchers[i % vouchers.length];

		await prismaClient.voucherUsage.create({
			data: {
				billId: bills[i].id,
				voucherId: voucher.id,
				usedAt: new Date(),
			},
		});
	}

	console.log("Applied 3 Vouchers");

	// =========================
	// 3. 3 BILL INCOMES
	// =========================
	for (let i = 0; i < 3; i++) {
		await prismaClient.billIncome.create({
			data: {
				code: `INC00${i + 1}`,
				cost: 500 + i * 100,
				status: "COMPLETE",
				paymentMethod: "CASH",
				employeeId: employees[i % employees.length].id,
				billId: bills[i].id,
				shortDescription: `Income for bill ${bills[i].code}`,
			},
		});
	}

	console.log("Created 3 Bill Incomes");

	// =========================
	// 4. 3 BILL OUTCOMES
	// =========================
	for (let i = 0; i < 3; i++) {
		await prismaClient.billOutcome.create({
			data: {
				code: `OUT00${i + 1}`,
				publisherId: publishers[i % publishers.length].id,
				employeeId: employees[i % employees.length].id,
				bookId: books[i % books.length].id,
				cost: 800 + i * 120,
				status: "COMPLETE",
				quantity: 2 + i,
			},
		});
	}

	console.log("Created 3 Bill Outcomes");
}

async function seeder() {
	try {
		await departmentSeeder();
		await positionSeeder();
		await authorSeeder();
		await publisherSeeder();
		await bookSeeder(); // ✅ NEW
		await adminSeeder();
		await employeeSeeder(); 
		await employeeRoleSeeder(); 
		await seedingCustomerData(); 
		await seedingRules();
		await voucherSeeder() 
		await billIncomeOutcomeSeeder() 
		console.log('Seeding completed');
	} catch (error) {
		console.error(error);
	} finally {
		await prismaClient.$disconnect();
	}
}

seeder();