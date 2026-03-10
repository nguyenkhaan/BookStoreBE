import { EmployeeStatus, PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClient = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function departmentSeeder()
{
    const DEPARTMENT_LISTS = [
        {
            name: 'Resource Department'
        },
        {
            name: 'Technical Department'
        },
        {
            name: 'Baking Department'
        }
    ]

    await prismaClient.department.createMany({
        data: DEPARTMENT_LISTS,
        skipDuplicates: true
    })

    console.log("Seeding Department Successfully")
}

async function positionSeeder()
{
    const POSITION_LISTS = [
        {
            name: 'Tech Lead',
            departmentId: 1 
        },
        {
            name: 'HR', 
            departmentId: 2 
        },
        {
            name: 'Employee', 
            departmentId: 3 
        }
    ]

    await prismaClient.position.createMany({
        data: POSITION_LISTS,
        skipDuplicates: true
    })

    console.log("Seeding Position Successfully")
}

async function adminSeeder()
{
    const ADMIN_EMAIL = 'admin@gmail.com'
    const ADMIN_PASSWORD = 'admin'

    const hashPassword = await Bun.password.hash(ADMIN_PASSWORD , {
        algorithm: 'bcrypt',
        cost: 10
    })

    const department = await prismaClient.department.findFirst({
        where: {
            name: "Technical Department"
        }
    })

    const position = await prismaClient.position.findFirst({
        where: {
            name: "Tech Lead"
        }
    })

    const admin = await prismaClient.employee.upsert({
        where: {
            email: ADMIN_EMAIL
        },
        update: {},
        create: {
            email: ADMIN_EMAIL,
            password: hashPassword,
            name: "Admin",
            departmentId: department!.id,
            positionId: position!.id, 
            phone: "081829292", 
            status: EmployeeStatus.WORKING 
        }
    })
    //Create roles 
    await prismaClient.userRole.createMany({
        data: [
            {
                userId: admin.id, 
                role: Role.ADMIN
            }, 
                        {
                userId: admin.id, 
                role: Role.EMPLOYEE
            }
        ]
    })

    console.log("Admin created:", admin.email)
}

async function seeder()
{
    try {

        await departmentSeeder()
        await positionSeeder()
        await adminSeeder()

        console.log("Seeding completed")

    } catch (error) {

        console.error(error)

    } finally {

        await prismaClient.$disconnect()

    }
}

seeder()