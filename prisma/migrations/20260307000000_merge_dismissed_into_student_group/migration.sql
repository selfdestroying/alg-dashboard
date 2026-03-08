-- AlterTable: Add dismissal fields to StudentGroup
ALTER TABLE "StudentGroup" ADD COLUMN "dismissComment" TEXT;
ALTER TABLE "StudentGroup" ADD COLUMN "dismissedAt" DATE;

-- Migrate Dismissed data into StudentGroup
INSERT INTO "StudentGroup" ("studentId", "groupId", "organizationId", "status", "lessonsBalance", "totalLessons", "totalPayments", "dismissComment", "dismissedAt", "createdAt", "updatedAt")
SELECT
  d."studentId",
  d."groupId",
  d."organizationId",
  'DISMISSED'::"StudentStatus",
  0,
  0,
  0,
  d."comment",
  d."date",
  d."createdAt",
  d."updatedAt"
FROM "Dismissed" d
ON CONFLICT ("studentId", "groupId") DO UPDATE SET
  "status" = 'DISMISSED'::"StudentStatus",
  "dismissComment" = EXCLUDED."dismissComment",
  "dismissedAt" = EXCLUDED."dismissedAt";

-- DropTable
DROP TABLE "Dismissed";
