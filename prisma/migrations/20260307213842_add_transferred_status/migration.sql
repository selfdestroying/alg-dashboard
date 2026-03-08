-- AlterEnum
ALTER TYPE "StudentStatus" ADD VALUE 'TRANSFERRED';

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "transferComment" TEXT,
ADD COLUMN     "transferredAt" DATE;
