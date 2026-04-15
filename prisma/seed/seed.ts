import {
	EmployeeStatus,
	PrismaClient,
	Role,
	BookCategory,
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

async function seeder() {
	try {
		await departmentSeeder();
		await positionSeeder();
		await authorSeeder();
		await publisherSeeder();
		await bookSeeder(); // ✅ NEW
		await adminSeeder();

		console.log('Seeding completed');
	} catch (error) {
		console.error(error);
	} finally {
		await prismaClient.$disconnect();
	}
}

seeder();
