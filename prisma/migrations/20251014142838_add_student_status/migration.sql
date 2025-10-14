-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('TRIAL', 'ACTIVE', 'DISMISSED');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "studentStatus" "StudentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE';
