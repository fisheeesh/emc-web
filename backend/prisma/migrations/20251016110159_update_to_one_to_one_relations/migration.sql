/*
  Warnings:

  - A unique constraint covering the columns `[criticalId]` on the table `AIAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[criticalId]` on the table `ActionPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_criticalId_key" ON "AIAnalysis"("criticalId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionPlan_criticalId_key" ON "ActionPlan"("criticalId");
