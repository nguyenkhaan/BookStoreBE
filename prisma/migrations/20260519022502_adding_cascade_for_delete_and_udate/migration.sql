/*
  Warnings:

  - A unique constraint covering the columns `[authorId,bookId]` on the table `AuthorBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billId,bookId]` on the table `BillDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[outcomeId,bookId]` on the table `BillOutcomeItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publisherId,bookId]` on the table `PublisherBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billId,voucherId]` on the table `VoucherUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AuthorBook" DROP CONSTRAINT "AuthorBook_authorId_fkey";

-- DropForeignKey
ALTER TABLE "AuthorBook" DROP CONSTRAINT "AuthorBook_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BillDetail" DROP CONSTRAINT "BillDetail_billId_fkey";

-- DropForeignKey
ALTER TABLE "BillIncome" DROP CONSTRAINT "BillIncome_billId_fkey";

-- DropForeignKey
ALTER TABLE "BillOutcomeItem" DROP CONSTRAINT "BillOutcomeItem_outcomeId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_bookId_fkey";

-- DropForeignKey
ALTER TABLE "PublisherBook" DROP CONSTRAINT "PublisherBook_bookId_fkey";

-- DropForeignKey
ALTER TABLE "PublisherBook" DROP CONSTRAINT "PublisherBook_publisherId_fkey";

-- DropForeignKey
ALTER TABLE "VoucherUsage" DROP CONSTRAINT "VoucherUsage_billId_fkey";

-- DropForeignKey
ALTER TABLE "VoucherUsage" DROP CONSTRAINT "VoucherUsage_voucherId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "AuthorBook_authorId_bookId_key" ON "AuthorBook"("authorId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BillDetail_billId_bookId_key" ON "BillDetail"("billId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BillOutcomeItem_outcomeId_bookId_key" ON "BillOutcomeItem"("outcomeId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "PublisherBook_publisherId_bookId_key" ON "PublisherBook"("publisherId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherUsage_billId_voucherId_key" ON "VoucherUsage"("billId", "voucherId");

-- AddForeignKey
ALTER TABLE "BillDetail" ADD CONSTRAINT "BillDetail_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublisherBook" ADD CONSTRAINT "PublisherBook_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublisherBook" ADD CONSTRAINT "PublisherBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillIncome" ADD CONSTRAINT "BillIncome_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOutcomeItem" ADD CONSTRAINT "BillOutcomeItem_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "BillOutcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
