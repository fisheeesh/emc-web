/*
  Warnings:

  - The `keyInsights` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recommendations` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AIAnalysis" DROP COLUMN "keyInsights",
ADD COLUMN     "keyInsights" TEXT[],
DROP COLUMN "recommendations",
ADD COLUMN     "recommendations" TEXT[];
