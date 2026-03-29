-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows: copy createdAt into date
UPDATE "Payment" SET "date" = "createdAt"::date;
