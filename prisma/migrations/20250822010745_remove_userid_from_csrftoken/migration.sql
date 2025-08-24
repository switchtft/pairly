/*
  Warnings:

  - You are about to drop the column `userId` on the `CSRFToken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CSRFToken" DROP CONSTRAINT "CSRFToken_userId_fkey";

-- AlterTable
ALTER TABLE "public"."CSRFToken" DROP COLUMN "userId";
