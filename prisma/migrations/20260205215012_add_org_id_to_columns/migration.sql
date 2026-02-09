/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Dismissed" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "organizationId" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "MakeUp" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "organizationId" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PayCheck" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PaymentProduct" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TeacherGroup" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TeacherLesson" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "StudentLessonsBalanceHistory" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UnprocessedPayment" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "rawData" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;




-- DropTable
DROP TABLE "Role";

-- AddForeignKey
ALTER TABLE "StudentLessonsBalanceHistory" ADD CONSTRAINT "StudentLessonsBalanceHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayCheck" ADD CONSTRAINT "PayCheck_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dismissed" ADD CONSTRAINT "Dismissed_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGroup" ADD CONSTRAINT "TeacherGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLesson" ADD CONSTRAINT "TeacherLesson_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MakeUp" ADD CONSTRAINT "MakeUp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnprocessedPayment" ADD CONSTRAINT "UnprocessedPayment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProduct" ADD CONSTRAINT "PaymentProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
