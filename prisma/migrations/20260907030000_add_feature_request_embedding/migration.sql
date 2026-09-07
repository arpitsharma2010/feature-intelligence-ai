CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "FeatureRequest" ADD COLUMN "embedding" vector(1536);
