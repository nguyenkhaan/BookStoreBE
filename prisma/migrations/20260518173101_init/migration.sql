/*
  Warnings:

  - You are about to drop the column `bookId` on the `BillOutcome` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `BillOutcome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BillOutcome" DROP COLUMN "bookId",
DROP COLUMN "quantity";
