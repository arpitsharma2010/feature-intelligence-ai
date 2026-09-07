import assert from "node:assert/strict";
import test from "node:test";

import { AI_TRIAGE_CONFIG } from "../lib/ai/config";
import {
  formatFeatureRequestInput,
  generateEmbedding,
  isValidEmbedding,
  withTimeout,
  type EmbeddingsClient,
} from "../lib/ai/embedding";
import { getOpenAIClient } from "../lib/ai/openai-client";

test("formats the canonical embedding input", () => {
  assert.equal(
    formatFeatureRequestInput({ title: "Export", description: "Download rows" }),
    "Title: Export\nDescription: Download rows",
  );
});

test("embedding requests explicitly select 1536 dimensions and disable retries", async () => {
  const embedding = Array(AI_TRIAGE_CONFIG.embeddingDimensions).fill(0.25);
  let body: Record<string, unknown> | undefined;
  let options: Record<string, unknown> | undefined;
  const client = {
    embeddings: {
      create: async (
        requestBody: Record<string, unknown>,
        requestOptions: Record<string, unknown>,
      ) => {
        body = requestBody;
        options = requestOptions;
        return { data: [{ embedding }] };
      },
    },
  } as unknown as EmbeddingsClient;

  const result = await generateEmbedding(client, "draft", 250);

  assert.equal(body?.dimensions, 1536);
  assert.equal(body?.model, "text-embedding-3-small");
  assert.equal(options?.maxRetries, 0);
  assert.equal(options?.timeout, 250);
  assert.equal(result, embedding);
});

test("embedding validation rejects incorrect lengths and non-finite values", () => {
  assert.equal(isValidEmbedding(Array(1535).fill(0)), false);
  assert.equal(
    isValidEmbedding([...Array(1535).fill(0), Number.POSITIVE_INFINITY]),
    false,
  );
  assert.equal(isValidEmbedding(Array(1536).fill(0)), true);
});

test("generateEmbedding rejects malformed provider vectors", async () => {
  const client = {
    embeddings: {
      create: async () => ({ data: [{ embedding: [1, 2, 3] }] }),
    },
  } as unknown as EmbeddingsClient;

  await assert.rejects(() => generateEmbedding(client, "draft", 50));
});

test("withTimeout rejects a provider call that exceeds its cap", async () => {
  await assert.rejects(
    () => withTimeout(new Promise<never>(() => undefined), 5),
    /timed out/,
  );
});

test("a missing OpenAI key produces a sanitized unavailable error", () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    assert.throws(() => getOpenAIClient(), /AI triage is unavailable/);
  } finally {
    if (original === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = original;
    }
  }
});
