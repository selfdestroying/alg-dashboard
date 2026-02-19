-- AlterTable
ALTER TABLE "TeacherGroup" ADD COLUMN     "bonusPerStudent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TeacherLesson" ADD COLUMN     "bonusPerStudent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonusPerStudent" INTEGER NOT NULL DEFAULT 0;
