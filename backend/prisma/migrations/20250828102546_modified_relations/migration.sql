/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `emotionCheckInId` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('EMPLOYEE', 'ADMIN', 'SUPERADMIN');
ALTER TABLE "public"."Employee" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."Employee" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."Employee" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AIAnalysis" DROP CONSTRAINT "AIAnalysis_emotionCheckInId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AIAnalysis" DROP CONSTRAINT "AIAnalysis_employeeId_fkey";

-- AlterTable
ALTER TABLE "public"."AIAnalysis" DROP COLUMN "emotionCheckInId";

-- AlterTable
ALTER TABLE "public"."Employee" DROP COLUMN "lastLogin",
ADD COLUMN     "lastCritical" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';

-- AddForeignKey
ALTER TABLE "public"."AIAnalysis" ADD CONSTRAINT "AIAnalysis_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."CriticalEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
