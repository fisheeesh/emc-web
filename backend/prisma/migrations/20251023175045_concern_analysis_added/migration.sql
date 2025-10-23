-- CreateTable
CREATE TABLE "ConcernAnalysis" (
    "id" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConcernAnalysis_pkey" PRIMARY KEY ("id")
);
