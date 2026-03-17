/*
  Warnings:

  - You are about to drop the column `parentsName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parentsPhone` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parentsName",
DROP COLUMN "parentsPhone";
