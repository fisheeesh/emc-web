/*
  Warnings:

  - You are about to drop the column `points` on the `EmotionCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmotionCheckIn" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "points";
