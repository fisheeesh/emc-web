/*
  Warnings:

  - You are about to drop the column `key` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Setting` table. All the data in the column will be lost.
  - Added the required column `criticalMin` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `negativeMin` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neutralMin` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positiveMin` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Setting_key_key";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "recentStreak" INTEGER;

-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "criticalMin" DECIMAL(3,1) NOT NULL,
ADD COLUMN     "negativeMin" DECIMAL(3,1) NOT NULL,
ADD COLUMN     "neutralMin" DECIMAL(3,1) NOT NULL,
ADD COLUMN     "positiveMin" DECIMAL(3,1) NOT NULL,
ADD COLUMN     "watchlistTrackMin" INTEGER NOT NULL DEFAULT 14;
