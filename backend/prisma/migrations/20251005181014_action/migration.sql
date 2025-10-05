-- CreateEnum
CREATE TYPE "public"."RType" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."RStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."ActionPlan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "quickAction" TEXT,
    "actionType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "assignTo" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "actionNotes" TEXT NOT NULL,
    "followUpNotes" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "status" "public"."RStatus" NOT NULL DEFAULT 'PENDING',
    "type" "public"."RType" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ActionPlan" ADD CONSTRAINT "ActionPlan_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
