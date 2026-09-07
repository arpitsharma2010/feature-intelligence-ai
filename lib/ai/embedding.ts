import type OpenAI from "openai";

import { AI_TRIAGE_CONFIG } from "@/lib/ai/config";

export type EmbeddingsClient = Pick<OpenAI, "embeddings">;

export function formatFeatureRequestInput(input: {
  title: string;
  description: string;
}) {
  return `Title: ${input.title}\nDescription: ${input.description}`;
}

export function isValidEmbedding(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === AI_TRIAGE_CONFIG.embeddingDimensions &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

export async function generateEmbedding(
  client: EmbeddingsClient,
  input: string,
  timeoutMs: number,
) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("The embedding deadline has expired.");
  }

  const response = await withTimeout(
    client.embeddings.create(
      {
        model: AI_TRIAGE_CONFIG.embeddingModel,
        input,
        dimensions: AI_TRIAGE_CONFIG.embeddingDimensions,
        encoding_format: "float",
      },
      { maxRetries: AI_TRIAGE_CONFIG.maxRetries, timeout: timeoutMs },
    ),
    timeoutMs,
  );
  const embedding = response.data[0]?.embedding;

  if (!isValidEmbedding(embedding)) {
    throw new Error("The embedding provider returned an invalid vector.");
  }

  return embedding;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("The AI request timed out.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
