/*
  Warnings:

  - You are about to drop the column `studentStatus` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "StudentLessonsBalanceChangeReason" ADD VALUE 'LESSON_CANCELLED';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "isTrial" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Attendance" SET "isTrial" = true
WHERE "studentStatus" = 'TRIAL';


ALTER TABLE "Attendance" DROP COLUMN "studentStatus"
