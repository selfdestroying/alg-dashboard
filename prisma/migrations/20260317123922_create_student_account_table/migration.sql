/*
  Warnings:

  - You are about to drop the column `coins` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `login` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "StudentAccount" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "StudentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentAccount_studentId_key" ON "StudentAccount"("studentId");

-- AddForeignKey
ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate existing data from Student to StudentAccount
INSERT INTO "StudentAccount" ("login", "password", "coins", "studentId")
SELECT "login", "password", "coins", "id"
FROM "Student"
WHERE "login" IS NOT NULL OR "password" IS NOT NULL;

-- Insert rows with missing login or password
INSERT INTO "StudentAccount" ("login", "password", "coins", "studentId")
SELECT 
  COALESCE("login", 'user_' || "id"),
  COALESCE("password", 'pass_' || "id"),
  "coins",
  "id"
FROM "Student"
WHERE "login" IS NULL OR "password" IS NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "coins",
DROP COLUMN "login",
DROP COLUMN "password";