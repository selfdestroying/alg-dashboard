-- CreateTable
CREATE TABLE "SnoozedAlert" (
    "id" SERIAL NOT NULL,
    "alertType" TEXT NOT NULL,
    "entityKey" TEXT NOT NULL,
    "snoozedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,
    "snoozedByUserId" INTEGER NOT NULL,

    CONSTRAINT "SnoozedAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SnoozedAlert_organizationId_snoozedUntil_idx" ON "SnoozedAlert"("organizationId", "snoozedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "SnoozedAlert_organizationId_alertType_entityKey_key" ON "SnoozedAlert"("organizationId", "alertType", "entityKey");

-- AddForeignKey
ALTER TABLE "SnoozedAlert" ADD CONSTRAINT "SnoozedAlert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
