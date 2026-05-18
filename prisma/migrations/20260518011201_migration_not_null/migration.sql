/*
  Warnings:

  - You are about to alter the column `debit` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "debit" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "grade" DROP NOT NULL;
