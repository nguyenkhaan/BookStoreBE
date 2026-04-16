import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Role } from '@prisma/client';
const prismaClient = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
import { EmployeeStatus } from "@prisma/client";
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
async function userRoleSeeder() {
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
async function main() {
    try 
    {
        await employeeSeeder() 
        await userRoleSeeder() 
    } 
    catch (err) {
        console.log(err) 
    }
}
main() 
