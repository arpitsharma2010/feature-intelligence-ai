export const AI_TRIAGE_CONFIG = Object.freeze({
  embeddingModel:
    process.env.AI_TRIAGE_EMBEDDING_MODEL || "text-embedding-3-small",
  embeddingDimensions: 1536,
  classifierModel: process.env.AI_TRIAGE_CLASSIFIER_MODEL || "gpt-5.6-luna",
  reasoningEffort: "none" as const,
  candidateLimit: 3,
  duplicateThreshold: 0.85,
  totalTimeoutMs: readPositiveInteger(
    process.env.AI_TRIAGE_TOTAL_TIMEOUT_MS,
    8_000,
  ),
  embeddingTimeoutMs: readPositiveInteger(
    process.env.AI_TRIAGE_EMBEDDING_TIMEOUT_MS,
    3_000,
  ),
  classificationTimeoutMs: readPositiveInteger(
    process.env.AI_TRIAGE_CLASSIFICATION_TIMEOUT_MS,
    5_000,
  ),
  maxRetries: 0,
});

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
