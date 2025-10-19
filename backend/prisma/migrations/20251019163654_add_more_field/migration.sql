-- CreateEnum
CREATE TYPE "WorkStyle" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID', 'WFH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "birthdate" TIMESTAMP(3),
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'MALE',
ADD COLUMN     "workStyle" "WorkStyle" NOT NULL DEFAULT 'ONSITE';
