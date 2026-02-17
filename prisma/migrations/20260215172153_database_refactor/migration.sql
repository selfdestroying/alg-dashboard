/*
  Warnings:

  - You are about to drop the column `backOfficeUrl` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `lessonCount` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `lessonPerWeek` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Group` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `originalPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `crmUrl` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Dismissed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Made the column `time` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Made the column `locationId` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dayOfWeek` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Made the column `time` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PayCheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastName` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birthDate` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `StudentGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudentLessonsBalanceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TeacherGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TeacherLesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UnprocessedPayment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dismissed" DROP CONSTRAINT "Dismissed_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Dismissed" DROP CONSTRAINT "Dismissed_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_locationId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'UNSPECIFIED',
ALTER COLUMN "comment" SET DEFAULT '',
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Dismissed" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Group" RENAME COLUMN "backOfficeUrl" TO "url";
ALTER TABLE "Group"
DROP COLUMN "endDate",
DROP COLUMN "lessonCount",
DROP COLUMN "lessonPerWeek",
DROP COLUMN "name",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "time" SET NOT NULL,
ALTER COLUMN "locationId" SET NOT NULL,
ALTER COLUMN "dayOfWeek" SET NOT NULL,
ALTER COLUMN "maxStudents" DROP DEFAULT,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "time" SET NOT NULL,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT,
ALTER COLUMN "role" SET DEFAULT 'teacher',
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PayCheck" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PaymentProduct" ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "originalPrice" SET DATA TYPE INTEGER;

-- Backfill NULL birthDate values before making it required
UPDATE "Student" SET "birthDate" = '2000-01-01T00:00:00.000Z' WHERE "birthDate" IS NULL;

-- AlterTable
ALTER TABLE "Student" RENAME COLUMN "crmUrl" TO "url";
ALTER TABLE "Student"
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudentLessonsBalanceHistory" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeacherGroup" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "bid" DROP DEFAULT,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeacherLesson" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "bid" DROP DEFAULT,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UnprocessedPayment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "resolved" SET DEFAULT false,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ALTER COLUMN "bidForIndividual" DROP DEFAULT,
ALTER COLUMN "bidForLesson" DROP DEFAULT;

-- DropEnum
DROP TYPE "UserStatus";

-- CreateIndex
CREATE INDEX "Attendance_lessonId_idx" ON "Attendance"("lessonId");

-- CreateIndex
CREATE INDEX "Attendance_organizationId_idx" ON "Attendance"("organizationId");

-- CreateIndex
CREATE INDEX "Cart_organizationId_idx" ON "Cart"("organizationId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE INDEX "Category_organizationId_idx" ON "Category"("organizationId");

-- CreateIndex
CREATE INDEX "Course_organizationId_idx" ON "Course"("organizationId");

-- CreateIndex
CREATE INDEX "Dismissed_studentId_idx" ON "Dismissed"("studentId");

-- CreateIndex
CREATE INDEX "Dismissed_groupId_idx" ON "Dismissed"("groupId");

-- CreateIndex
CREATE INDEX "Dismissed_organizationId_idx" ON "Dismissed"("organizationId");

-- CreateIndex
CREATE INDEX "Group_organizationId_idx" ON "Group"("organizationId");

-- CreateIndex
CREATE INDEX "Group_courseId_idx" ON "Group"("courseId");

-- CreateIndex
CREATE INDEX "Group_locationId_idx" ON "Group"("locationId");

-- CreateIndex
CREATE INDEX "Lesson_groupId_idx" ON "Lesson"("groupId");

-- CreateIndex
CREATE INDEX "Lesson_organizationId_idx" ON "Lesson"("organizationId");

-- CreateIndex
CREATE INDEX "Lesson_date_idx" ON "Lesson"("date");

-- CreateIndex
CREATE INDEX "Location_organizationId_idx" ON "Location"("organizationId");

-- CreateIndex
CREATE INDEX "MakeUp_organizationId_idx" ON "MakeUp"("organizationId");

-- CreateIndex
CREATE INDEX "Order_productId_idx" ON "Order"("productId");

-- CreateIndex
CREATE INDEX "Order_studentId_idx" ON "Order"("studentId");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "PayCheck_userId_idx" ON "PayCheck"("userId");

-- CreateIndex
CREATE INDEX "PayCheck_organizationId_idx" ON "PayCheck"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentProduct_organizationId_idx" ON "PaymentProduct"("organizationId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE INDEX "Student_organizationId_idx" ON "Student"("organizationId");

-- CreateIndex
CREATE INDEX "StudentGroup_groupId_idx" ON "StudentGroup"("groupId");

-- CreateIndex
CREATE INDEX "StudentGroup_organizationId_idx" ON "StudentGroup"("organizationId");

-- CreateIndex
CREATE INDEX "StudentLessonsBalanceHistory_organizationId_idx" ON "StudentLessonsBalanceHistory"("organizationId");

-- CreateIndex
CREATE INDEX "TeacherGroup_groupId_idx" ON "TeacherGroup"("groupId");

-- CreateIndex
CREATE INDEX "TeacherGroup_organizationId_idx" ON "TeacherGroup"("organizationId");

-- CreateIndex
CREATE INDEX "TeacherLesson_lessonId_idx" ON "TeacherLesson"("lessonId");

-- CreateIndex
CREATE INDEX "TeacherLesson_organizationId_idx" ON "TeacherLesson"("organizationId");

-- CreateIndex
CREATE INDEX "UnprocessedPayment_organizationId_idx" ON "UnprocessedPayment"("organizationId");

-- CreateIndex
CREATE INDEX "UnprocessedPayment_studentId_idx" ON "UnprocessedPayment"("studentId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dismissed" ADD CONSTRAINT "Dismissed_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dismissed" ADD CONSTRAINT "Dismissed_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
