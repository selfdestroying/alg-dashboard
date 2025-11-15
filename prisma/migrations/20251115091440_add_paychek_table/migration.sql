-- CreateTable
CREATE TABLE "PayCheck" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PayCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PayCheck" ADD CONSTRAINT "PayCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
