/*
  Warnings:

  - You are about to drop the column `bidForLesson` on the `TeacherGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TeacherGroup" DROP COLUMN "bidForLesson",
ADD COLUMN     "bid" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TeacherLesson" ADD COLUMN     "bid" INTEGER NOT NULL DEFAULT 0;
