-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "underlyingNeed" TEXT,
    "theme" TEXT,
    "customerImpact" INTEGER,
    "strategicValue" INTEGER,
    "urgency" INTEGER,
    "priorityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);
