/*
  Warnings:

  - You are about to drop the column `mode` on the `queue_entries` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `queue_entries` table. All the data in the column will be lost.
  - Added the required column `originalAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameMode` to the `queue_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerMatch` to the `queue_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `queue_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountCodeId" INTEGER,
ADD COLUMN     "originalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "queueEntryId" INTEGER,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "method" SET DEFAULT 'stripe';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."queue_entries" DROP COLUMN "mode",
DROP COLUMN "price",
ADD COLUMN     "gameMode" TEXT NOT NULL,
ADD COLUMN     "numberOfMatches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "pricePerMatch" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "teammatesNeeded" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "public"."discount_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdBy" INTEGER NOT NULL,
    "minAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "applicableGames" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discount_code_usage" (
    "id" SERIAL NOT NULL,
    "discountCodeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "discount_code_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "public"."discount_codes"("code");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "public"."queue_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "public"."discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_code_usage" ADD CONSTRAINT "discount_code_usage_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "public"."discount_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_code_usage" ADD CONSTRAINT "discount_code_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
