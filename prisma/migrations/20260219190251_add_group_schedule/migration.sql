-- CreateTable
CREATE TABLE "GroupSchedule" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "GroupSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupSchedule_groupId_idx" ON "GroupSchedule"("groupId");

-- CreateIndex
CREATE INDEX "GroupSchedule_organizationId_idx" ON "GroupSchedule"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSchedule_groupId_dayOfWeek_key" ON "GroupSchedule"("groupId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "GroupSchedule" ADD CONSTRAINT "GroupSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSchedule" ADD CONSTRAINT "GroupSchedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
