-- DropForeignKey
ALTER TABLE "BillOutcome" DROP CONSTRAINT "BillOutcome_bookId_fkey";

-- CreateTable
CREATE TABLE "BillOutcomeItem" (
    "id" SERIAL NOT NULL,
    "outcomeId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteAt" TIMESTAMP(3),

    CONSTRAINT "BillOutcomeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillOutcomeItem_outcomeId_idx" ON "BillOutcomeItem"("outcomeId");

-- CreateIndex
CREATE INDEX "BillOutcomeItem_bookId_idx" ON "BillOutcomeItem"("bookId");

-- AddForeignKey
ALTER TABLE "BillOutcomeItem" ADD CONSTRAINT "BillOutcomeItem_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "BillOutcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOutcomeItem" ADD CONSTRAINT "BillOutcomeItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
