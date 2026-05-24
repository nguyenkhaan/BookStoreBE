import {
	EmployeeStatus,
	PrismaClient,
	Role,
	BookCategory,
	BillStatus,
	RuleStatus,
	RuleType,
	MemberGrade,
	Prisma,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClient = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function getRandomDate() {
	const end = new Date('2026-05-20T00:00:00Z');
	const start = new Date('2025-11-01T00:00:00Z');
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

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
}

async function authorSeeder() {
	const authors = [
		{ code: 'AUTHOR001', name: 'Ngo Thua An' },
		{ code: 'AUTHOR002', name: 'Hua Trong Lam' },
		{ code: 'AUTHOR003', name: 'J.K. Rowling' },
		{ code: 'AUTHOR004', name: 'Fujiko F. Fujio' },
		{ code: 'AUTHOR005', name: 'Dale Carnegie' },
		{ code: 'AUTHOR006', name: 'Robert C. Martin' },
		{ code: 'AUTHOR007', name: 'Yuval Noah Harari' },
		{ code: 'AUTHOR008', name: 'Paulo Coelho' },
		{ code: 'AUTHOR009', name: 'Erich Gamma' },
		{ code: 'AUTHOR010', name: 'Martin Fowler' },
		{ code: 'AUTHOR011', name: 'Andrew Hunt' },
		{ code: 'AUTHOR012', name: 'Eric Evans' },
		{ code: 'AUTHOR013', name: 'Uncle Bob' },
		{ code: 'AUTHOR014', name: 'Fred Brooks' },
		{ code: 'AUTHOR015', name: 'Steve McConnell' },
	];

	await prismaClient.author.createMany({
		data: authors,
		skipDuplicates: true,
	});
}

async function bookSeeder() {
	const books = [
		{
			code: 'BOOK001',
			title: 'Journey to the West',
			cost: 120000,
			year: 2020,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK002',
			title: 'Heavenly War',
			cost: 150000,
			year: 2021,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK003',
			title: 'Harry Potter 1',
			cost: 250000,
			year: 1997,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK004',
			title: 'Doraemon Vol 1',
			cost: 25000,
			year: 1992,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK005',
			title: 'Dac Nhan Tam',
			cost: 85000,
			year: 1936,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK006',
			title: 'Clean Code',
			cost: 450000,
			year: 2008,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK007',
			title: 'Sapiens',
			cost: 300000,
			year: 2011,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK008',
			title: 'Nha Gia Kim',
			cost: 79000,
			year: 1988,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK009',
			title: 'Design Patterns',
			cost: 500000,
			year: 1994,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK010',
			title: 'Refactoring',
			cost: 480000,
			year: 1999,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK011',
			title: 'The Pragmatic Programmer',
			cost: 400000,
			year: 1999,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK012',
			title: 'Domain-Driven Design',
			cost: 550000,
			year: 2003,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK013',
			title: 'Clean Architecture',
			cost: 450000,
			year: 2017,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK014',
			title: 'The Mythical Man-Month',
			cost: 350000,
			year: 1975,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK015',
			title: 'Code Complete',
			cost: 600000,
			year: 1993,
			category: BookCategory.THIEU_NHI,
		},
	];

	await prismaClient.book.createMany({
		data: books,
		skipDuplicates: true,
	});

	const allBooks = await prismaClient.book.findMany();
	const allAuthors = await prismaClient.author.findMany();
	const allPublishers = await prismaClient.publisher.findMany();

	const authorBooks = allBooks.map((book, index) => ({
		bookId: book.id,
		authorId: allAuthors[index % allAuthors.length].id,
	}));

	await prismaClient.authorBook.createMany({
		data: authorBooks,
		skipDuplicates: true,
	});

	const publisherBooks = allBooks.map((book, index) => ({
		bookId: book.id,
		publisherId: allPublishers[index % allPublishers.length].id,
	}));

	await prismaClient.publisherBook.createMany({
		data: publisherBooks,
		skipDuplicates: true,
	});

	const inventories = allBooks.map((book) => ({
		bookId: book.id,
		stock: Math.floor(Math.random() * 101) + 300,
	}));

	await prismaClient.inventory.createMany({
		data: inventories,
		skipDuplicates: true,
	});
}

async function adminSeeder() {
	const ADMIN_EMAIL = 'admin@gmail.com';
	const ADMIN_PASSWORD = 'cloudian';

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
}

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
			email: '24520059@gm.uit.edu.vn',
			phone: '0900000001',
			name: 'Nguyen Van A',
			departmentId: departments[0].id,
			positionId: positions[0].id,
			status: EmployeeStatus.WORKING,
			active: true,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view?usp=sharing',
			salary: 12000000,
		},
		{
			code: 'NV002',
			email: 'employee2@gmail.com',
			phone: '0900000002',
			name: 'Tran Thi B',
			departmentId: departments[1].id,
			positionId: positions[1].id,
			status: EmployeeStatus.WORKING,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view?usp=sharing',
			active: true,
			salary: 15000000,
		},
		{
			code: 'NV003',
			email: 'employee3@gmail.com',
			phone: '0900000003',
			name: 'Le Van C',
			departmentId: departments[2].id,
			positionId: positions[2].id,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view?usp=sharing',
			status: EmployeeStatus.RETIRED,
			active: false,
			salary: 10000000,
		},
	];

	await prismaClient.employee.createMany({
		data: employees.map((emp) => ({
			...emp,
			password: hashedPassword,
		})),
		skipDuplicates: true,
	});
}

async function employeeRoleSeeder() {
	const employees = await prismaClient.employee.findMany();

	const roles = employees.map((emp) => ({
		userId: emp.id,
		role: Role.EMPLOYEE,
	}));

	await prismaClient.userRole.createMany({
		data: roles,
		skipDuplicates: true,
	});
}

async function seedingCustomerData() {
	await prismaClient.customer.createMany({
		data: [
			{
				code: 'KH001',
				name: 'Nguyen Van An',
				email: 'an.nguyen@example.com',
				phone: '0914234564',
				password: 'hashed_password_1',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH002',
				name: 'Tran Thi Bich',
				email: 'bich.tran@example.com',
				phone: '0901234567',
				password: 'hashed_password_2',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH003',
				name: 'Le Hoang Minh',
				email: 'minh.le@example.com',
				phone: '0923456789',
				password: 'hashed_password_3',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH004',
				name: 'Pham Quoc Bao',
				email: 'bao.pham@example.com',
				phone: '0934567890',
				password: 'hashed_password_4',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH005',
				name: 'Vo Thi Lan',
				email: 'lan.vo@example.com',
				phone: '0945678901',
				password: 'hashed_password_5',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH006',
				name: 'Dao Tuan Anh',
				email: 'anh.dao@example.com',
				phone: '0981234561',
				password: 'hashed_password_6',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH007',
				name: 'Vu Hoang Yen',
				email: 'yen.vu@example.com',
				phone: '0981234562',
				password: 'hashed_password_7',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH008',
				name: 'Bui Thanh Son',
				email: 'son.bui@example.com',
				phone: '0981234563',
				password: 'hashed_password_8',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH009',
				name: 'Doan Truc Ly',
				email: 'ly.doan@example.com',
				phone: '0981234564',
				password: 'hashed_password_9',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH010',
				name: 'Dinh Nhat Vu',
				email: 'vu.dinh@example.com',
				phone: '0981234565',
				password: 'hashed_password_10',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH011',
				name: 'Hoang Kim Ngan',
				email: 'ngan.hoang@example.com',
				phone: '0981234566',
				password: 'hashed_password_11',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH012',
				name: 'Trinh Van Dat',
				email: 'dat.trinh@example.com',
				phone: '0981234567',
				password: 'hashed_password_12',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH013',
				name: 'Ngo Minh Khoa',
				email: 'khoa.ngo@example.com',
				phone: '0981234568',
				password: 'hashed_password_13',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH014',
				name: 'Phan Thuy Tien',
				email: 'tien.phan@example.com',
				phone: '0981234569',
				password: 'hashed_password_14',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH015',
				name: 'Lam Gia Huy',
				email: 'huy.lam@example.com',
				phone: '0981234570',
				password: 'hashed_password_15',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH016',
				name: 'Chau Ngoc Thao',
				email: 'thao.chau@example.com',
				phone: '0981234571',
				password: 'hashed_password_16',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH017',
				name: 'Ly Tuan Phat',
				email: 'phat.ly@example.com',
				phone: '0981234572',
				password: 'hashed_password_17',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH018',
				name: 'Mai Thi Hue',
				email: 'hue.mai@example.com',
				phone: '0981234573',
				password: 'hashed_password_18',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH019',
				name: 'Ton That Binh',
				email: 'binh.ton@example.com',
				phone: '0981234574',
				password: 'hashed_password_19',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH020',
				name: 'Vuong Nhat Minh',
				email: 'minh.vuong@example.com',
				phone: '0981234575',
				password: 'hashed_password_20',
				grade: MemberGrade.BRONZE,
			},
		],
		skipDuplicates: true,
	});
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
}

async function voucherSeeder() {
	await prismaClient.voucher.createMany({
		data: [
			{
				name: 'DISCOUNT_10_PERCENT',
				code: 'KM001',
				eventName: 'Summer Sale 10%',
				sale: 10,
				status: 'APPLYING',
				usedNumber: 0,
				quantity: 100,
				expiresAt: new Date('2026-12-31'),
				startDate: new Date('2026-01-01'),
				type: 'PERCENT',
				description: 'Giam 10% toan bo don hang',
			},
			{
				name: 'DISCOUNT_20_PERCENT',
				code: 'KM020',
				eventName: 'Big Sale 20%',
				sale: 20,
				status: 'APPLYING',
				usedNumber: 0,
				quantity: 50,
				expiresAt: new Date('2026-12-31'),
				startDate: new Date('2026-01-01'),
				type: 'PERCENT',
				description: 'Giam 20% don hang lon',
			},
			{
				name: 'WELCOME_50K',
				code: 'KM050',
				eventName: 'Welcome New Customer',
				sale: 50000,
				status: 'UPCOMING',
				usedNumber: 0,
				quantity: 200,
				expiresAt: new Date('2026-06-30'),
				startDate: new Date('2026-05-01'),
				type: 'VND',
				description: 'Giam 50k cho khach hang moi',
			},
			{
				name: 'EXPIRED_TEST',
				code: 'KM040',
				eventName: 'Old Campaign',
				sale: 15,
				status: 'ENDED',
				usedNumber: 10,
				quantity: 10,
				expiresAt: new Date('2025-01-01'),
				startDate: new Date('2024-01-01'),
				type: 'PERCENT',
				description: 'Voucher da het han',
			},
		],
		skipDuplicates: true,
	});
}

async function billIncomeOutcomeSeeder() {
	const customers = await prismaClient.customer.findMany();
	const books = await prismaClient.book.findMany();
	const employees = await prismaClient.employee.findMany();
	const vouchers = await prismaClient.voucher.findMany();
	const publishers = await prismaClient.publisher.findMany();

	if (!customers.length || !books.length || !employees.length) {
		throw new Error('Missing required seed data');
	}

	const bills = [];

	for (let i = 0; i < 150; i++) {
		const book1 = books[i % books.length];
		const book2 = books[(i + 3) % books.length];

		const qty1 = (i % 4) + 1;
		const qty2 = (i % 3) + 1;

		const totalCost = Number(book1.cost) * qty1 + Number(book2.cost) * qty2;

		let debitAmount = 0;
		const scenarioFlag = i % 3;

		if (scenarioFlag === 0) {
			debitAmount = 0;
		} else if (scenarioFlag === 1) {
			debitAmount = totalCost * 0.2;
		} else {
			debitAmount = totalCost * 0.4;
		}

		const randomDate = getRandomDate();

		const bill = await prismaClient.bill.create({
			data: {
				code: `HD${String(i + 1).padStart(4, '0')}`,
				customerId: customers[i % customers.length].id,
				status: BillStatus.COMPLETE,
				cost: totalCost,
				debit: debitAmount,
				createdAt: randomDate,
				updatedAt: randomDate,
				billDetail: {
					create: [
						{ bookId: book1.id, quantity: qty1 },
						{ bookId: book2.id, quantity: qty2 },
					],
				},
			},
		});
		bills.push(bill);

		const incomeAmount = totalCost - debitAmount;
		if (incomeAmount > 0) {
			await prismaClient.billIncome.create({
				data: {
					code: `INC${String(i + 1).padStart(4, '0')}`,
					cost: incomeAmount,
					status: 'COMPLETE',
					paymentMethod: 'CASH',
					employeeId: employees[i % employees.length].id,
					billId: bill.id,
					createdAt: randomDate,
					updatedAt: randomDate,
					shortDescription: `Income for bill ${bill.code}`,
				},
			});
		}

		if (i % 5 === 0) {
			const voucher = vouchers[i % vouchers.length];
			await prismaClient.voucherUsage.create({
				data: {
					billId: bill.id,
					voucherId: voucher.id,
					usedAt: randomDate,
				},
			});
		}
	}

	for (let i = 0; i < 30; i++) {
		const book1 = books[i % books.length];
		const book2 = books[(i + 5) % books.length];
		const qty1 = Math.floor(Math.random() * 50) + 100;
		const qty2 = Math.floor(Math.random() * 50) + 100;

		const totalOutcomeCost =
			Number(book1.cost) * qty1 + Number(book2.cost) * qty2;
		const randomDate = getRandomDate();

		await prismaClient.billOutcome.create({
			data: {
				code: `OUT${String(i + 1).padStart(3, '0')}`,
				publisherId: publishers[i % publishers.length].id,
				employeeId: employees[i % employees.length].id,
				status: 'COMPLETE',
				cost: new Prisma.Decimal(totalOutcomeCost),
				createdAt: randomDate,
				updatedAt: randomDate,
				outcomeItems: {
					create: [
						{
							bookId: book1.id,
							quantity: qty1,
							unitCost: book1.cost,
						},
						{
							bookId: book2.id,
							quantity: qty2,
							unitCost: book2.cost,
						},
					],
				},
			},
		});
	}
}

async function SeedingSetting() {
	const defaultSettings = [
		{ key: 'SALARY_MAX', value: '100000000', description: 'Lương tối đa cho nhân viên' },
		{ key: 'COST_MAX', value: '10000000', description: 'Chi phí tối đa' },
		{
			key: 'STOCK_MIN',
			value: '20',
			description: 'Số lượng sách tối thiểu phải có trong kho',
		},
		{
			key: 'DEBIT_MAX',
			value: '100000',
			description: 'Số nợ tối đa của khách hàng',
		},
		{ key: 'TI_GIA_BAN', value: '1.05', description: 'Tỉ giá bán sách' },
		{
			key: 'STOCK_IMPORT_NUMBER_MIN',
			value: '150',
			description: 'Số lượng sách tối thiểu khi nhập hàng',
		},
		{
			key: 'STOCK_MAX',
			value: '800',
			description: 'Số lượng sách tối đa trong kho',
		},
	];
	await prismaClient.systemSetting.createMany({
		data: defaultSettings,
	});
}

async function seeder() {
	try {
		await departmentSeeder();
		await positionSeeder();
		await authorSeeder();
		await publisherSeeder();
		await bookSeeder();
		await adminSeeder();
		await employeeSeeder();
		await employeeRoleSeeder();
		await seedingCustomerData();
		await seedingRules();
		await voucherSeeder();
		await billIncomeOutcomeSeeder();
		await SeedingSetting();
	} catch (error) {
		console.error(error);
	} finally {
		await prismaClient.$disconnect();
	}
}

seeder();
