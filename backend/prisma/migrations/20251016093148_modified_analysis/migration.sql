/*
  Warnings:

  - You are about to drop the column `input` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `AIAnalysis` table. All the data in the column will be lost.
  - Added the required column `keyInsights` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moodTrends` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendations` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIAnalysis" DROP COLUMN "input",
DROP COLUMN "output",
ADD COLUMN     "keyInsights" TEXT NOT NULL,
ADD COLUMN     "moodTrends" TEXT NOT NULL,
ADD COLUMN     "recommendations" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "avgScore" SET DEFAULT 1,
ALTER COLUMN "emotionCount" SET DEFAULT 1,
ALTER COLUMN "emotionSum" SET DEFAULT 1,
ALTER COLUMN "points" SET DEFAULT 1000;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "avatar" DROP NOT NULL;
