/*
  Warnings:

  - You are about to alter the column `from` on the `ActionPlan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `to` on the `ActionPlan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `actionType` on the `ActionPlan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `priority` column on the `ActionPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `assignTo` on the `ActionPlan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `status` on the `CriticalEmployee` table. All the data in the column will be lost.
  - Added the required column `criticalId` to the `ActionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `CriticalEmployee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."ActionPlan" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "criticalId" INTEGER NOT NULL,
ADD COLUMN     "suggestions" TEXT,
ALTER COLUMN "from" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "to" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "actionType" SET DATA TYPE VARCHAR(100),
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "assignTo" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."CriticalEmployee" DROP COLUMN "status",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "isResolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ALTER COLUMN "emotionScore" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."EmotionCheckIn" ALTER COLUMN "emotionScore" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "points" BIGINT DEFAULT 0,
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "emotionSum" SET DATA TYPE DECIMAL(6,2);

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "toSAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Otp" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."Setting" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "key" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "value" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "ActionPlan_criticalId_idx" ON "public"."ActionPlan"("criticalId");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_idx" ON "public"."ActionPlan"("departmentId");

-- CreateIndex
CREATE INDEX "ActionPlan_status_idx" ON "public"."ActionPlan"("status");

-- CreateIndex
CREATE INDEX "ActionPlan_priority_idx" ON "public"."ActionPlan"("priority");

-- CreateIndex
CREATE INDEX "ActionPlan_actionType_idx" ON "public"."ActionPlan"("actionType");

-- CreateIndex
CREATE INDEX "ActionPlan_createdAt_idx" ON "public"."ActionPlan"("createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_dueDate_idx" ON "public"."ActionPlan"("dueDate");

-- CreateIndex
CREATE INDEX "ActionPlan_completedAt_idx" ON "public"."ActionPlan"("completedAt");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_status_idx" ON "public"."ActionPlan"("departmentId", "status");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_priority_idx" ON "public"."ActionPlan"("departmentId", "priority");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_createdAt_idx" ON "public"."ActionPlan"("departmentId", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_status_createdAt_idx" ON "public"."ActionPlan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_status_priority_idx" ON "public"."ActionPlan"("status", "priority");

-- CreateIndex
CREATE INDEX "ActionPlan_status_dueDate_idx" ON "public"."ActionPlan"("status", "dueDate");

-- CreateIndex
CREATE INDEX "ActionPlan_priority_createdAt_idx" ON "public"."ActionPlan"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_actionType_status_idx" ON "public"."ActionPlan"("actionType", "status");

-- CreateIndex
CREATE INDEX "ActionPlan_criticalId_createdAt_idx" ON "public"."ActionPlan"("criticalId", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_status_createdAt_idx" ON "public"."ActionPlan"("departmentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_status_priority_idx" ON "public"."ActionPlan"("departmentId", "status", "priority");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_actionType_status_idx" ON "public"."ActionPlan"("departmentId", "actionType", "status");

-- CreateIndex
CREATE INDEX "ActionPlan_status_priority_createdAt_idx" ON "public"."ActionPlan"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_status_priority_dueDate_idx" ON "public"."ActionPlan"("status", "priority", "dueDate");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_priority_createdAt_idx" ON "public"."ActionPlan"("departmentId", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "ActionPlan_departmentId_status_priority_createdAt_idx" ON "public"."ActionPlan"("departmentId", "status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_employeeId_idx" ON "public"."CriticalEmployee"("employeeId");

-- CreateIndex
CREATE INDEX "CriticalEmployee_departmentId_idx" ON "public"."CriticalEmployee"("departmentId");

-- CreateIndex
CREATE INDEX "CriticalEmployee_isResolved_idx" ON "public"."CriticalEmployee"("isResolved");

-- CreateIndex
CREATE INDEX "CriticalEmployee_createdAt_idx" ON "public"."CriticalEmployee"("createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_resolvedAt_idx" ON "public"."CriticalEmployee"("resolvedAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_departmentId_isResolved_idx" ON "public"."CriticalEmployee"("departmentId", "isResolved");

-- CreateIndex
CREATE INDEX "CriticalEmployee_departmentId_createdAt_idx" ON "public"."CriticalEmployee"("departmentId", "createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_isResolved_createdAt_idx" ON "public"."CriticalEmployee"("isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_employeeId_createdAt_idx" ON "public"."CriticalEmployee"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_employeeId_isResolved_idx" ON "public"."CriticalEmployee"("employeeId", "isResolved");

-- CreateIndex
CREATE INDEX "CriticalEmployee_departmentId_isResolved_createdAt_idx" ON "public"."CriticalEmployee"("departmentId", "isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "CriticalEmployee_employeeId_isResolved_createdAt_idx" ON "public"."CriticalEmployee"("employeeId", "isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_employeeId_idx" ON "public"."EmotionCheckIn"("employeeId");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_emotionScore_idx" ON "public"."EmotionCheckIn"("emotionScore");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_createdAt_idx" ON "public"."EmotionCheckIn"("createdAt");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_employeeId_createdAt_idx" ON "public"."EmotionCheckIn"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_employeeId_emotionScore_idx" ON "public"."EmotionCheckIn"("employeeId", "emotionScore");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_emotionScore_createdAt_idx" ON "public"."EmotionCheckIn"("emotionScore", "createdAt");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_createdAt_emotionScore_idx" ON "public"."EmotionCheckIn"("createdAt", "emotionScore");

-- CreateIndex
CREATE INDEX "EmotionCheckIn_employeeId_createdAt_emotionScore_idx" ON "public"."EmotionCheckIn"("employeeId", "createdAt", "emotionScore");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "public"."Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "public"."Employee"("role");

-- CreateIndex
CREATE INDEX "Employee_accType_idx" ON "public"."Employee"("accType");

-- CreateIndex
CREATE INDEX "Employee_jobType_idx" ON "public"."Employee"("jobType");

-- CreateIndex
CREATE INDEX "Employee_position_idx" ON "public"."Employee"("position");

-- CreateIndex
CREATE INDEX "Employee_createdAt_idx" ON "public"."Employee"("createdAt");

-- CreateIndex
CREATE INDEX "Employee_avgScore_idx" ON "public"."Employee"("avgScore");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "public"."Employee"("status");

-- CreateIndex
CREATE INDEX "Employee_departmentId_role_idx" ON "public"."Employee"("departmentId", "role");

-- CreateIndex
CREATE INDEX "Employee_departmentId_jobType_idx" ON "public"."Employee"("departmentId", "jobType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_accType_idx" ON "public"."Employee"("departmentId", "accType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_position_idx" ON "public"."Employee"("departmentId", "position");

-- CreateIndex
CREATE INDEX "Employee_departmentId_status_idx" ON "public"."Employee"("departmentId", "status");

-- CreateIndex
CREATE INDEX "Employee_role_accType_idx" ON "public"."Employee"("role", "accType");

-- CreateIndex
CREATE INDEX "Employee_jobType_accType_idx" ON "public"."Employee"("jobType", "accType");

-- CreateIndex
CREATE INDEX "Employee_accType_position_idx" ON "public"."Employee"("accType", "position");

-- CreateIndex
CREATE INDEX "Employee_departmentId_avgScore_idx" ON "public"."Employee"("departmentId", "avgScore");

-- CreateIndex
CREATE INDEX "Employee_status_avgScore_idx" ON "public"."Employee"("status", "avgScore");

-- CreateIndex
CREATE INDEX "Employee_departmentId_role_accType_idx" ON "public"."Employee"("departmentId", "role", "accType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_jobType_accType_idx" ON "public"."Employee"("departmentId", "jobType", "accType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_role_jobType_idx" ON "public"."Employee"("departmentId", "role", "jobType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_status_avgScore_idx" ON "public"."Employee"("departmentId", "status", "avgScore");

-- CreateIndex
CREATE INDEX "Employee_role_jobType_accType_idx" ON "public"."Employee"("role", "jobType", "accType");

-- CreateIndex
CREATE INDEX "Employee_departmentId_accType_position_idx" ON "public"."Employee"("departmentId", "accType", "position");

-- CreateIndex
CREATE INDEX "Employee_firstName_lastName_idx" ON "public"."Employee"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "public"."Employee"("email");

-- AddForeignKey
ALTER TABLE "public"."CriticalEmployee" ADD CONSTRAINT "CriticalEmployee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActionPlan" ADD CONSTRAINT "ActionPlan_criticalId_fkey" FOREIGN KEY ("criticalId") REFERENCES "public"."CriticalEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
