-- CreateEnum
CREATE TYPE "StudentLessonsBalanceChangeReason" AS ENUM ('PAYMENT_CREATED', 'PAYMENT_CANCELLED', 'ATTENDANCE_PRESENT_CHARGED', 'ATTENDANCE_ABSENT_CHARGED', 'MAKEUP_ATTENDED_CHARGED', 'ATTENDANCE_REVERTED', 'MAKEUP_GRANTED', 'MANUAL_SET');

-- CreateTable
CREATE TABLE "StudentLessonsBalanceHistory" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "actorUserId" INTEGER,
    "reason" "StudentLessonsBalanceChangeReason" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "comment" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentLessonsBalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentLessonsBalanceHistory_studentId_createdAt_idx" ON "StudentLessonsBalanceHistory"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentLessonsBalanceHistory_actorUserId_createdAt_idx" ON "StudentLessonsBalanceHistory"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudentLessonsBalanceHistory" ADD CONSTRAINT "StudentLessonsBalanceHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonsBalanceHistory" ADD CONSTRAINT "StudentLessonsBalanceHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
