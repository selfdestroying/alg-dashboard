-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StudentLessonsBalanceChangeReason" ADD VALUE 'WALLET_MERGED';
ALTER TYPE "StudentLessonsBalanceChangeReason" ADD VALUE 'WALLET_TRANSFER';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "walletId" INTEGER;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "walletId" INTEGER;

-- AlterTable
ALTER TABLE "StudentLessonsBalanceHistory" ADD COLUMN     "walletId" INTEGER;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "lessonsBalance" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "totalPayments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wallet_organizationId_idx" ON "Wallet"("organizationId");

-- CreateIndex
CREATE INDEX "Wallet_studentId_idx" ON "Wallet"("studentId");

-- CreateIndex
CREATE INDEX "Payment_walletId_idx" ON "Payment"("walletId");

-- CreateIndex
CREATE INDEX "StudentGroup_walletId_idx" ON "StudentGroup"("walletId");

-- CreateIndex
CREATE INDEX "StudentLessonsBalanceHistory_walletId_idx" ON "StudentLessonsBalanceHistory"("walletId");

-- AddForeignKey
ALTER TABLE "StudentLessonsBalanceHistory" ADD CONSTRAINT "StudentLessonsBalanceHistory_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
