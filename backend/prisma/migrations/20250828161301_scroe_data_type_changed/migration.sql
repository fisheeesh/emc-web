/*
  Warnings:

  - You are about to alter the column `emotionScore` on the `CriticalEmployee` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.
  - You are about to alter the column `emotionScore` on the `EmotionCheckIn` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE "public"."CriticalEmployee" ALTER COLUMN "emotionScore" SET DEFAULT 0,
ALTER COLUMN "emotionScore" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "public"."EmotionCheckIn" ALTER COLUMN "emotionScore" SET DEFAULT 0,
ALTER COLUMN "emotionScore" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "avgScore" DECIMAL(3,2) NOT NULL DEFAULT 0;
