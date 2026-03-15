-- AlterTable: Add self-referential makeup link to Attendance
ALTER TABLE "Attendance" ADD COLUMN "makeupForAttendanceId" INTEGER;

-- Data migration: Transfer MakeUp links into Attendance self-referential FK.
-- For each MakeUp row, set makeupForAttendanceId on the makeup attendance
-- to point to the missed attendance.
UPDATE "Attendance"
SET "makeupForAttendanceId" = m."missedAttendanceId"
FROM "MakeUp" m
WHERE "Attendance"."id" = m."makeUpAttendaceId";

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_makeupForAttendanceId_fkey" FOREIGN KEY ("makeupForAttendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_makeupForAttendanceId_key" ON "Attendance"("makeupForAttendanceId");

-- DropForeignKey
ALTER TABLE "MakeUp" DROP CONSTRAINT "MakeUp_makeUpAttendaceId_fkey";

-- DropForeignKey
ALTER TABLE "MakeUp" DROP CONSTRAINT "MakeUp_missedAttendanceId_fkey";

-- DropForeignKey
ALTER TABLE "MakeUp" DROP CONSTRAINT "MakeUp_organizationId_fkey";

-- DropTable
DROP TABLE "MakeUp";
