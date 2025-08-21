-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockUntil" TIMESTAMP(3);
