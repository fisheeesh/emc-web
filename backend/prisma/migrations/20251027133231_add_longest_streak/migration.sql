/*
  Warnings:

  - You are about to drop the column `streak` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "streak",
ADD COLUMN     "longestStreak" INTEGER,
ADD COLUMN     "recentStreak" INTEGER;
