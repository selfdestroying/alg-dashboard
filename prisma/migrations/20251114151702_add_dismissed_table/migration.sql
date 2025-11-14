-- CreateTable
CREATE TABLE "Dismissed" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dismissed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dismissed" ADD CONSTRAINT "Dismissed_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dismissed" ADD CONSTRAINT "Dismissed_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
