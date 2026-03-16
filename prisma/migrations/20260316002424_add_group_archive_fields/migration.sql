-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "archiveComment" TEXT,
ADD COLUMN     "archivedAt" DATE,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Group_isArchived_idx" ON "Group"("isArchived");
