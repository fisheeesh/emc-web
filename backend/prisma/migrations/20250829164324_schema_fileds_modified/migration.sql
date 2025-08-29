/*
  Warnings:

  - You are about to drop the column `employeeId` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `CriticalEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `CriticalEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CriticalEmployee` table. All the data in the column will be lost.
  - Added the required column `analysisId` to the `CriticalEmployee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AIAnalysis" DROP CONSTRAINT "AIAnalysis_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CriticalEmployee" DROP CONSTRAINT "CriticalEmployee_departmentId_fkey";

-- AlterTable
ALTER TABLE "public"."AIAnalysis" DROP COLUMN "employeeId";

-- AlterTable
ALTER TABLE "public"."CriticalEmployee" DROP COLUMN "departmentId",
DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "analysisId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CriticalEmployee" ADD CONSTRAINT "CriticalEmployee_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."AIAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
