/*
  Warnings:

  - You are about to drop the column `analysisId` on the `CriticalEmployee` table. All the data in the column will be lost.
  - Added the required column `criticalId` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CriticalEmployee" DROP CONSTRAINT "CriticalEmployee_analysisId_fkey";

-- AlterTable
ALTER TABLE "public"."AIAnalysis" ADD COLUMN     "criticalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."CriticalEmployee" DROP COLUMN "analysisId",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "emotionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emotionSum" DECIMAL(3,2) NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."AIAnalysis" ADD CONSTRAINT "AIAnalysis_criticalId_fkey" FOREIGN KEY ("criticalId") REFERENCES "public"."CriticalEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
