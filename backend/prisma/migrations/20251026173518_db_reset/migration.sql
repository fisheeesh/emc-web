/*
  Warnings:

  - The primary key for the `ConcernAnalysis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ConcernAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `textFeeling` on the `EmotionCheckIn` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `otp` on the `Otp` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.

*/
-- AlterTable
ALTER TABLE "ConcernAnalysis" DROP CONSTRAINT "ConcernAnalysis_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "ConcernAnalysis_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EmotionCheckIn" ALTER COLUMN "textFeeling" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "otp" SET DATA TYPE VARCHAR(6);
