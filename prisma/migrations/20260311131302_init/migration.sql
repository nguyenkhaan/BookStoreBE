-- CreateEnum
CREATE TYPE "BookCategory" AS ENUM ('HORROR', 'MANGA', 'SCIENCE_FICTION');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "IncomeStatus" AS ENUM ('NOT_STARTED', 'COMPLETE', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('NOT_STARTED', 'COMPLETE', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('APPLYING', 'ENDED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('RESET_PASSWORD', 'ACCESS', 'REFRESH', 'VERIFY_EMAIL');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('WORKING', 'RETIRED');

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "customerId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillIncome" (
    "id" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "IncomeStatus" NOT NULL DEFAULT 'COMPLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BillIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillOutcome" (
    "id" TEXT NOT NULL,
    "publisherId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "status" "OutcomeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BillOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "bookId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("bookId")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "publisherId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverImage" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "EmployeeStatus" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "departmentId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "sale" DECIMAL(65,30) NOT NULL,
    "status" "VoucherStatus" NOT NULL,
    "usedNumber" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherUsage" (
    "id" SERIAL NOT NULL,
    "billId" TEXT NOT NULL,
    "billIncomeId" TEXT NOT NULL,
    "voucherId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "VoucherUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_name_key" ON "Publisher"("name");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "Author"("name");

-- CreateIndex
CREATE INDEX "Book_cost_idx" ON "Book"("cost");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");

-- CreateIndex
CREATE INDEX "Rule_title_idx" ON "Rule"("title");

-- AddForeignKey
ALTER TABLE "BillIncome" ADD CONSTRAINT "BillIncome_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillIncome" ADD CONSTRAINT "BillIncome_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOutcome" ADD CONSTRAINT "BillOutcome_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOutcome" ADD CONSTRAINT "BillOutcome_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_billIncomeId_fkey" FOREIGN KEY ("billIncomeId") REFERENCES "BillIncome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
