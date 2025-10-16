/*
  Warnings:

  - You are about to drop the column `moodTrends` on the `AIAnalysis` table. All the data in the column will be lost.
  - Added the required column `moodTrend` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallMood` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekRange` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIAnalysis" DROP COLUMN "moodTrends",
ADD COLUMN     "moodTrend" TEXT NOT NULL,
ADD COLUMN     "overallMood" TEXT NOT NULL,
ADD COLUMN     "weekRange" TEXT NOT NULL;
