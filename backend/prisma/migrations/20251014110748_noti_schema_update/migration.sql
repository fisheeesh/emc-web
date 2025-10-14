/*
  Warnings:

  - Added the required column `avatar` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NotifType" AS ENUM ('CRITICAL', 'REQUEST', 'RESPONSE', 'NORMAL');

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "type" "public"."NotifType" NOT NULL DEFAULT 'CRITICAL';
