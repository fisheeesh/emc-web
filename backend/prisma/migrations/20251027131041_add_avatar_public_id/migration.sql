-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "avatarPublicId" TEXT,
ALTER COLUMN "avgScore" SET DEFAULT 0,
ALTER COLUMN "emotionCount" SET DEFAULT 0,
ALTER COLUMN "emotionSum" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "avatarPublicId" TEXT;
