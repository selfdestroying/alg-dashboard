-- CreateTable
CREATE TABLE "PaymentProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "lessonCount" INTEGER NOT NULL,

    CONSTRAINT "PaymentProduct_pkey" PRIMARY KEY ("id")
);
