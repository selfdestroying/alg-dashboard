-- CreateEnum
CREATE TYPE "StudentFinancialField" AS ENUM ('LESSONS_BALANCE', 'TOTAL_PAYMENTS', 'TOTAL_LESSONS');

-- AlterTable
ALTER TABLE "StudentLessonsBalanceHistory" ADD COLUMN     "field" "StudentFinancialField" NOT NULL DEFAULT 'LESSONS_BALANCE';
