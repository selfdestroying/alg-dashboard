/*
  Warnings:

  - You are about to drop the column `lessonsBalance` on the `StudentGroup` table. All the data in the column will be lost.
  - You are about to drop the column `totalLessons` on the `StudentGroup` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayments` on the `StudentGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentGroup" DROP COLUMN "lessonsBalance",
DROP COLUMN "totalLessons",
DROP COLUMN "totalPayments";
