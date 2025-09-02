/*
  Warnings:

  - The values [ACTIVE,FREEZE] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AccType" AS ENUM ('ACTIVE', 'FREEZE');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Status_new" AS ENUM ('NORMAL', 'CRITICAL', 'WATCHLIST');
ALTER TABLE "public"."CriticalEmployee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Employee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Employee" ALTER COLUMN "status" TYPE "public"."Status_new" USING ("status"::text::"public"."Status_new");
ALTER TABLE "public"."CriticalEmployee" ALTER COLUMN "status" TYPE "public"."Status_new" USING ("status"::text::"public"."Status_new");
ALTER TYPE "public"."Status" RENAME TO "Status_old";
ALTER TYPE "public"."Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "public"."CriticalEmployee" ALTER COLUMN "status" SET DEFAULT 'NORMAL';
ALTER TABLE "public"."Employee" ALTER COLUMN "status" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."CriticalEmployee" ALTER COLUMN "status" SET DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "accType" "public"."AccType" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "jobType" "public"."JobType" NOT NULL DEFAULT 'FULLTIME',
ADD COLUMN     "position" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NORMAL';
