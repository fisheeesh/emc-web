-- DropForeignKey
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
