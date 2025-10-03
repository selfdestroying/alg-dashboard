-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "leadName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "UnprocessedPayment" (
    "id" SERIAL NOT NULL,
    "rawData" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" INTEGER,

    CONSTRAINT "UnprocessedPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnprocessedPayment" ADD CONSTRAINT "UnprocessedPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
