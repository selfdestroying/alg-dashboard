/*
  Warnings:

  - You are about to drop the column `reason` on the `PayCheck` table. All the data in the column will be lost.
  - Added the required column `comment` to the `PayCheck` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PayCheck" DROP COLUMN "reason",
ADD COLUMN     "comment" TEXT NOT NULL;
