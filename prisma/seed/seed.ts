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
		{ name: 'Phòng Nhân sự' },
		{ name: 'Phòng Kỹ thuật' },
		{ name: 'Phòng Bán hàng' },
		{ name: 'Phòng Chăm sóc khách hàng' },
		{ name: 'Phòng Kế toán' },
	];

	await prismaClient.department.createMany({
		data: DEPARTMENT_LISTS,
		skipDuplicates: true,
	});
}

async function positionSeeder() {
	const POSITION_LISTS = [
		{ name: 'Trưởng phòng Kỹ thuật', departmentId: 2 },
		{ name: 'Chuyên viên Nhân sự', departmentId: 1 },
		{ name: 'Nhân viên Bán hàng', departmentId: 3 },
		{ name: 'Chuyên viên CSKH', departmentId: 4 },
		{ name: 'Kế toán trưởng', departmentId: 5 },
	];

	await prismaClient.position.createMany({
		data: POSITION_LISTS,
		skipDuplicates: true,
	});
}

async function publisherSeeder() {
	const publishers = [
		{ name: 'NXB Kim Đồng' },
		{ name: 'NXB Trẻ' },
		{ name: 'NXB Giáo Dục' },
		{ name: 'NXB Tổng Hợp' },
		{ name: 'NXB Hội Nhà Văn' },
	];

	await prismaClient.publisher.createMany({
		data: publishers,
		skipDuplicates: true,
	});
}

async function authorSeeder() {
	const authors = [
		{ code: 'AUTHOR001', name: 'Ngô Thừa Ân' },
		{ code: 'AUTHOR002', name: 'Nguyễn Nhật Ánh' },
		{ code: 'AUTHOR003', name: 'J.K. Rowling' },
		{ code: 'AUTHOR004', name: 'Fujiko F. Fujio' },
		{ code: 'AUTHOR005', name: 'Dale Carnegie' },
		{ code: 'AUTHOR006', name: 'Robert C. Martin' },
		{ code: 'AUTHOR007', name: 'Yuval Noah Harari' },
		{ code: 'AUTHOR008', name: 'Paulo Coelho' },
		{ code: 'AUTHOR009', name: 'Erich Gamma' },
		{ code: 'AUTHOR010', name: 'Martin Fowler' },
		{ code: 'AUTHOR011', name: 'Ngô Tất Tố' },
		{ code: 'AUTHOR012', name: 'Nam Cao' },
		{ code: 'AUTHOR013', name: 'Uncle Bob' },
		{ code: 'AUTHOR014', name: 'Thạch Lam' },
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
			title: 'Tây Du Ký',
			cost: 120000,
			year: 2020,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK002',
			title: 'Kính Vạn Hoa',
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
			title: 'Doraemon Tập 1',
			cost: 25000,
			year: 1992,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK005',
			title: 'Đắc Nhân Tâm',
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
			title: 'Sapiens - Lược Sử Loài Người',
			cost: 300000,
			year: 2011,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK008',
			title: 'Nhà Giả Kim',
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
			title: 'Tắt Đèn',
			cost: 400000,
			year: 1999,
			category: BookCategory.THIEU_NHI,
		},
		{
			code: 'BOOK012',
			title: 'Chí Phèo',
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
			title: 'Gió Lạnh Đầu Mùa',
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
		stock: 500,
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
		where: { name: 'Phòng Kỹ thuật' },
	});

	const position = await prismaClient.position.findFirst({
		where: { name: 'Trưởng phòng Kỹ thuật' },
	});

	const admin = await prismaClient.employee.upsert({
		where: { email: ADMIN_EMAIL },
		update: {},
		create: {
			email: ADMIN_EMAIL,
			password: hashPassword,
			code: 'NV000',
			name: 'Quản trị viên',
			departmentId: department!.id,
			positionId: position!.id,
			updatedAt: new Date(Date.now()), 
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
			email: 'nhanvien1@gmail.com',
			phone: '0900000001',
			name: 'Nguyễn Văn A',
			departmentId: departments[0].id,
			positionId: positions[0].id,
			status: EmployeeStatus.WORKING,
			active: true,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view',
			salary: 12000000,
			updatedAt : new Date(Date.now()) 
		},
		{
			code: 'NV002',
			email: 'nhanvien2@gmail.com',
			phone: '0900000002',
			name: 'Trần Thị B',
			departmentId: departments[1].id,
			positionId: positions[1].id,
			status: EmployeeStatus.WORKING,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view',
			active: true,
			salary: 15000000,
			updatedAt : new Date(Date.now()) 
		},
		{
			code: 'NV003',
			email: 'nhanvien3@gmail.com',
			phone: '0900000003',
			name: 'Lê Văn C',
			departmentId: departments[2].id,
			positionId: positions[2].id,
			resume: 'https://drive.google.com/file/d/13JSo5306YRzPLV6xC1twL8MHYKyZzxTD/view',
			status: EmployeeStatus.RETIRED,
			active: false,
			salary: 10000000,
			updatedAt : new Date(Date.now()) 
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
				name: 'Nguyễn Văn An',
				email: 'an.nguyen@example.com',
				phone: '0914234564',
				password: 'hashed_password_1',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH002',
				name: 'Trần Thị Bích',
				email: 'bich.tran@example.com',
				phone: '0901234567',
				password: 'hashed_password_2',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH003',
				name: 'Lê Hoàng Minh',
				email: 'minh.le@example.com',
				phone: '0923456789',
				password: 'hashed_password_3',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH004',
				name: 'Phạm Quốc Bảo',
				email: 'bao.pham@example.com',
				phone: '0934567890',
				password: 'hashed_password_4',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH005',
				name: 'Võ Thị Lan',
				email: 'lan.vo@example.com',
				phone: '0945678901',
				password: 'hashed_password_5',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH006',
				name: 'Đào Tuấn Anh',
				email: 'anh.dao@example.com',
				phone: '0981234561',
				password: 'hashed_password_6',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH007',
				name: 'Vũ Hoàng Yến',
				email: 'yen.vu@example.com',
				phone: '0981234562',
				password: 'hashed_password_7',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH008',
				name: 'Bùi Thanh Sơn',
				email: 'son.bui@example.com',
				phone: '0981234563',
				password: 'hashed_password_8',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH009',
				name: 'Đoàn Trúc Ly',
				email: 'ly.doan@example.com',
				phone: '0981234564',
				password: 'hashed_password_9',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH010',
				name: 'Đinh Nhật Vũ',
				email: 'vu.dinh@example.com',
				phone: '0981234565',
				password: 'hashed_password_10',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH011',
				name: 'Hoàng Kim Ngân',
				email: 'ngan.hoang@example.com',
				phone: '0981234566',
				password: 'hashed_password_11',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH012',
				name: 'Trịnh Văn Đạt',
				email: 'dat.trinh@example.com',
				phone: '0981234567',
				password: 'hashed_password_12',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH013',
				name: 'Ngô Minh Khoa',
				email: 'khoa.ngo@example.com',
				phone: '0981234568',
				password: 'hashed_password_13',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH014',
				name: 'Phan Thủy Tiên',
				email: 'tien.phan@example.com',
				phone: '0981234569',
				password: 'hashed_password_14',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH015',
				name: 'Lâm Gia Huy',
				email: 'huy.lam@example.com',
				phone: '0981234570',
				password: 'hashed_password_15',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH016',
				name: 'Châu Ngọc Thảo',
				email: 'thao.chau@example.com',
				phone: '0981234571',
				password: 'hashed_password_16',
				grade: MemberGrade.DIAMOND,
			},
			{
				code: 'KH017',
				name: 'Lý Tuấn Phát',
				email: 'phat.ly@example.com',
				phone: '0981234572',
				password: 'hashed_password_17',
				grade: MemberGrade.BRONZE,
			},
			{
				code: 'KH018',
				name: 'Mai Thị Huệ',
				email: 'hue.mai@example.com',
				phone: '0981234573',
				password: 'hashed_password_18',
				grade: MemberGrade.SILVER,
			},
			{
				code: 'KH019',
				name: 'Tôn Thất Bình',
				email: 'binh.ton@example.com',
				phone: '0981234574',
				password: 'hashed_password_19',
				grade: MemberGrade.GOLD,
			},
			{
				code: 'KH020',
				name: 'Vương Nhật Minh',
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
				title: 'Chính sách điểm danh nhân viên',
				content:
					'Nhân viên phải có mặt trước 9:00 sáng. Đến muộn quá 3 lần mỗi tháng sẽ bị xem xét kỷ luật.',
				shortDescription: 'Quy định về thời gian làm việc và chuyên cần.',
				type: RuleType.HUMAN,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-01-01'),
			},
			{
				title: 'Chính sách giảm giá cho thành viên',
				content:
					'Thành viên hạng Vàng và Kim cương được giảm giá lần lượt là 10% và 15% cho tất cả đơn hàng.',
				shortDescription: 'Quy định giảm giá theo cấp bậc thành viên.',
				type: RuleType.SALE,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-02-01'),
			},
			{
				title: 'Quy định quản lý kho hàng',
				content:
					'Tất cả hàng hóa phải được kiểm tra và ghi chép cẩn thận trước khi nhập vào kho.',
				shortDescription: 'Hướng dẫn vận hành kho hàng.',
				type: RuleType.LOGISTIC,
				status: RuleStatus.UPCOMING,
				creatorId: 1,
				appliedAt: new Date('2025-05-01'),
			},
			{
				title: 'Tiêu chuẩn dịch vụ khách hàng',
				content:
					'Tất cả khách hàng phải được nhân viên chào đón trong vòng 30 giây kể từ khi bước vào cửa hàng.',
				shortDescription: 'Kỳ vọng về chất lượng phục vụ của nhân viên.',
				type: RuleType.SERVICE,
				status: RuleStatus.APPLYING,
				creatorId: 1,
				appliedAt: new Date('2025-03-01'),
			},
			{
				title: 'Quy trình phê duyệt tài chính',
				content:
					'Tất cả các khoản chi phí trên 10.000.000 VNĐ đều yêu cầu sự phê duyệt của quản lý.',
				shortDescription: 'Quy định về phê duyệt các giao dịch tài chính.',
				type: RuleType.FINANCE,
				status: RuleStatus.UPCOMING,
				creatorId: 1,
				appliedAt: new Date('2025-01-15'),
			},
			{
				title: 'Quy định an toàn lao động',
				content:
					'Nhân viên phải mặc đồ bảo hộ trong các khu vực được chỉ định mọi lúc.',
				shortDescription: 'Yêu cầu về an toàn tại nơi làm việc.',
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
				name: 'GIAM_10_PHAN_TRAM',
				code: 'KM001',
				eventName: 'Khuyến mãi mùa hè 10%',
				sale: 10,
				status: 'APPLYING',
				usedNumber: 0,
				quantity: 100,
				startDate: new Date('2026-01-01'),
				expiresAt: new Date('2026-12-31'),
				type: 'PERCENT',
				description: 'Giảm 10% toàn bộ đơn hàng',
			},
			{
				name: 'GIAM_20_PHAN_TRAM',
				code: 'KM020',
				eventName: 'Đại tiệc siêu sale 20%',
				sale: 20,
				status: 'APPLYING',
				usedNumber: 0,
				quantity: 50,
				startDate: new Date('2026-01-01'),
				expiresAt: new Date('2026-12-31'),
				type: 'PERCENT',
				description: 'Giảm 20% cho đơn hàng lớn',
			},
			{
				name: 'CHAO_MUNG_50K',
				code: 'KM050',
				eventName: 'Chào mừng khách hàng mới',
				sale: 50000,
				status: 'UPCOMING',
				usedNumber: 0,
				quantity: 200,
				startDate: new Date('2026-05-01'),
				expiresAt: new Date('2026-06-30'),
				type: 'VND',
				description: 'Giảm trực tiếp 50.000đ cho khách hàng mới',
			},
			{
				name: 'TEST_HET_HAN',
				code: 'KM040',
				eventName: 'Chiến dịch cũ',
				sale: 15,
				status: 'ENDED',
				usedNumber: 10,
				quantity: 10,
				startDate: new Date('2024-01-01'),
				expiresAt: new Date('2025-01-01'),
				type: 'PERCENT',
				description: 'Voucher đã hết hạn',
			},
		],
		skipDuplicates: true,
	});
}

// async function billIncomeOutcomeSeeder() {
// 	const customers = await prismaClient.customer.findMany();
// 	const books = await prismaClient.book.findMany();
// 	const employees = await prismaClient.employee.findMany();
// 	const vouchers = await prismaClient.voucher.findMany();
// 	const publishers = await prismaClient.publisher.findMany();

// 	const stockMap = new Map<number, number>();
// 	for (const book of books) {
// 		const inv = await prismaClient.inventory.findFirst({ where: { bookId: book.id } });
// 		stockMap.set(book.id, inv?.stock ?? 500);
// 	}

// 	const customerDebitMap = new Map<number, number>();
// 	for (const customer of customers) {
// 		customerDebitMap.set(customer.id, 0);
// 	}

// 	const sellingPrice = (cost: number) => Math.round(cost * 1.05);

// 	const highDebitCustomers = customers.slice(0, 2);
// 	let billCount = 0;

// 	for (let i = 0; i < highDebitCustomers.length; i++) {
// 		const customer = highDebitCustomers[i];
// 		const book1 = books[0];
// 		const book2 = books[1];
// 		const qty1 = 5;
// 		const qty2 = 5;

// 		const stock1 = stockMap.get(book1.id) ?? 0;
// 		const stock2 = stockMap.get(book2.id) ?? 0;

// 		if (stock1 - qty1 < 20 || stock2 - qty2 < 20) continue;

// 		const unitSell1 = sellingPrice(Number(book1.cost));
// 		const unitSell2 = sellingPrice(Number(book2.cost));
// 		const totalCost = unitSell1 * qty1 + unitSell2 * qty2;

// 		const debitAmount = 1500000;
// 		const randomDate = getRandomDate();

// 		const bill = await prismaClient.bill.create({
// 			data: {
// 				code: `HD${String(billCount + 1).padStart(4, '0')}`,
// 				customerId: customer.id,
// 				status: BillStatus.COMPLETE,
// 				cost: totalCost,
// 				debit: debitAmount,
// 				createdAt: randomDate,
// 				updatedAt: randomDate,
// 				billDetail: {
// 					create: [
// 						{ bookId: book1.id, quantity: qty1 },
// 						{ bookId: book2.id, quantity: qty2 },
// 					],
// 				},
// 			},
// 		});

// 		stockMap.set(book1.id, stock1 - qty1);
// 		stockMap.set(book2.id, stock2 - qty2);
// 		customerDebitMap.set(customer.id, (customerDebitMap.get(customer.id) ?? 0) + debitAmount);
// 		billCount++;

// 		const incomeAmount = totalCost - debitAmount;
// 		if (incomeAmount > 0) {
// 			await prismaClient.billIncome.create({
// 				data: {
// 					code: `PT${String(billCount).padStart(4, '0')}`,
// 					cost: incomeAmount,
// 					status: 'COMPLETE',
// 					paymentMethod: 'CASH',
// 					employeeId: employees[i % employees.length].id,
// 					billId: bill.id,
// 					createdAt: randomDate,
// 					updatedAt: randomDate,
// 					shortDescription: `Phiếu thu cho hóa đơn ${bill.code}`,
// 				},
// 			});
// 		}
// 	}

// 	const eligibleCustomers = customers.filter((_, i) => i >= 2);

// 	for (let i = 0; i < 200; i++) {
// 		const customer = eligibleCustomers[i % eligibleCustomers.length];
// 		const currentDebit = customerDebitMap.get(customer.id) ?? 0;

// 		if (currentDebit > 1000000) continue;

// 		const book1 = books[i % books.length];
// 		const book2 = books[(i + 3) % books.length];

// 		const qty1 = (i % 5) + 1;
// 		const qty2 = (i % 3) + 1;

// 		const stock1 = stockMap.get(book1.id) ?? 0;
// 		const stock2 = stockMap.get(book2.id) ?? 0;

// 		const willProceedStatus = i % 10;
// 		let currentBillStatus = BillStatus.COMPLETE;
// 		if (willProceedStatus === 8) currentBillStatus = BillStatus.COMPLETE;
// 		if (willProceedStatus === 9) currentBillStatus = BillStatus.COMPLETE;

// 		if (currentBillStatus !== BillStatus.COMPLETE && (stock1 - qty1 < 20 || stock2 - qty2 < 20)) continue;

// 		const unitSell1 = sellingPrice(Number(book1.cost));
// 		const unitSell2 = sellingPrice(Number(book2.cost));
// 		const totalCost = unitSell1 * qty1 + unitSell2 * qty2;

// 		let actualDebit = 0;
// 		if (currentBillStatus === BillStatus.COMPLETE) {
// 			const scenarioFlag = i % 4;
// 			let tentativeDebit = 0;
			
// 			if (scenarioFlag === 0) {
// 				tentativeDebit = 0;
// 			} else if (scenarioFlag === 1) {
// 				tentativeDebit = Math.round(totalCost * 0.1);
// 			} else if (scenarioFlag === 2) {
// 				tentativeDebit = Math.round(totalCost * 0.3);
// 			} else {
// 				tentativeDebit = totalCost;
// 			}

// 			if (currentDebit + tentativeDebit <= 1000000) {
// 				actualDebit = tentativeDebit;
// 			} else {
// 				actualDebit = 0;
// 			}
// 		}

// 		const randomDate = getRandomDate();

// 		const bill = await prismaClient.bill.create({
// 			data: {
// 				code: `HD${String(billCount + 1).padStart(4, '0')}`,
// 				customerId: customer.id,
// 				status: currentBillStatus,
// 				cost: totalCost,
// 				debit: actualDebit,
// 				createdAt: randomDate,
// 				updatedAt: randomDate,
// 				billDetail: {
// 					create: [
// 						{ bookId: book1.id, quantity: qty1 },
// 						{ bookId: book2.id, quantity: qty2 },
// 					],
// 				},
// 			},
// 		});

// 		if (currentBillStatus === BillStatus.COMPLETE) {
// 			stockMap.set(book1.id, stock1 - qty1);
// 			stockMap.set(book2.id, stock2 - qty2);
// 			customerDebitMap.set(customer.id, currentDebit + actualDebit);

// 			const incomeAmount = totalCost - actualDebit;
// 			if (incomeAmount > 0) {
// 				await prismaClient.billIncome.create({
// 					data: {
// 						code: `PT${String(billCount + 1).padStart(4, '0')}`,
// 						cost: incomeAmount,
// 						status: 'COMPLETE',
// 						paymentMethod: 'CASH',
// 						employeeId: employees[i % employees.length].id,
// 						billId: bill.id,
// 						createdAt: randomDate,
// 						updatedAt: randomDate,
// 						shortDescription: `Phiếu thu thanh toán cho hóa đơn ${bill.code}`,
// 					},
// 				});
// 			}

// 			if (i % 7 === 0) {
// 				const voucher = vouchers[i % vouchers.length];
// 				await prismaClient.voucherUsage.create({
// 					data: {
// 						billId: bill.id,
// 						voucherId: voucher.id,
// 						usedAt: randomDate,
// 					},
// 				});
// 			}
// 		} else if (currentBillStatus === BillStatus.OVERDUE) {
// 			stockMap.set(book1.id, stock1 - qty1);
// 			stockMap.set(book2.id, stock2 - qty2);
// 		}

// 		billCount++;
// 	}

// 	for (const [bookId, currentStock] of Array.from(stockMap.entries())) {
// 		await prismaClient.inventory.updateMany({
// 			where: { bookId: bookId },
// 			data: { stock: currentStock },
// 		});
// 	}

// 	let outcomeCount = 0;
// 	for (const book of books) {
// 		const currentStock = stockMap.get(book.id) ?? 0;
// 		if (currentStock < 300) {
// 			const importQty = Math.floor(Math.random() * 50) + 150;
// 			const totalOutcomeCost = Number(book.cost) * importQty;
// 			const randomDate = getRandomDate();

// 			await prismaClient.billOutcome.create({
// 				data: {
// 					code: `PN${String(outcomeCount + 1).padStart(3, '0')}`,
// 					publisherId: publishers[outcomeCount % publishers.length].id,
// 					employeeId: employees[outcomeCount % employees.length].id,
// 					status: 'COMPLETE',
// 					cost: new Prisma.Decimal(totalOutcomeCost),
// 					createdAt: randomDate,
// 					updatedAt: randomDate,
// 					outcomeItems: {
// 						create: [
// 							{
// 								bookId: book.id,
// 								quantity: importQty,
// 								unitCost: book.cost,
// 							},
// 						],
// 					},
// 				},
// 			});

// 			await prismaClient.inventory.updateMany({
// 				where: { bookId: book.id },
// 				data: { stock: currentStock + importQty },
// 			});

// 			outcomeCount++;
// 		}
// 	}
// }


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
		{
			id: 1,
			key: 'SALARY_MAX',
			value: '100000000',
			description: 'Lương tối đa cho nhân viên',
		},
		{
			id: 2,
			key: 'COST_MAX',
			value: '10000000',
			description: 'Chi phí tối đa',
		},
		{
			id: 3,
			key: 'STOCK_MIN',
			value: '20',
			description: 'Số lượng sách tối thiểu phải có trong kho sau khi bán',
		},
		{
			id: 4,
			key: 'DEBIT_MAX',
			value: '1000000',
			description: 'Số nợ tối đa của khách hàng',
		},
		{
			id: 5,
			key: 'TI_GIA_BAN',
			value: '1.05',
			description: 'Tỉ giá bán sách so với giá nhập',
		},
		{
			id: 6,
			key: 'STOCK_IMPORT_NUMBER_MIN',
			value: '150',
			description: 'Số lượng sách tối thiểu cần nhập mỗi lần',
		},
		{
			id: 7,
			key: 'STOCK_MAX',
			value: '300',
			description: 'Số lượng tồn tối đa được phép nhập thêm',
		},
		{
			id : 8, 
			key: 'BAO_DONG_DO',
			value : '300', 
			description: 'Số sách báo động đỏ trong kho'

		}
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