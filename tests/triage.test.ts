import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyWithOpenAI,
  createDuplicateTriageGraph,
  remainingBudget,
  runDuplicateTriage,
  shouldRecommendDuplicate,
  validateClassifierOutput,
  type TriageCandidate,
} from "../lib/ai/triage";

const draft = { title: "CSV", description: "Download dashboard data" };
const candidate: TriageCandidate = {
  id: "request-1",
  title: "Export dashboard CSV",
  description: "Download filtered analytics",
  supportCount: 4,
  similarity: 0.92,
};

function output(confidence: number) {
  return {
    relationship: "duplicate" as const,
    matchedRequestId: candidate.id,
    confidence,
    rationale: "Both request the same filtered dashboard CSV export.",
  };
}

test("duplicate routing applies below, exactly at, and above the threshold", () => {
  assert.equal(shouldRecommendDuplicate(output(0.849)), false);
  assert.equal(shouldRecommendDuplicate(output(0.85)), true);
  assert.equal(shouldRecommendDuplicate(output(0.99)), true);
});

test("classifier output enforces the retrieved candidate allow-list", () => {
  assert.throws(() =>
    validateClassifierOutput(
      { ...output(0.95), matchedRequestId: "not-retrieved" },
      [candidate],
    ),
  );
  assert.throws(() =>
    validateClassifierOutput(
      {
        relationship: "distinct",
        matchedRequestId: candidate.id,
        confidence: 0.7,
        rationale: "Different outcomes.",
      },
      [candidate],
    ),
  );
});

test("no candidates bypasses the classifier", async () => {
  let classifications = 0;
  const graph = createDuplicateTriageGraph({
    generateEmbedding: async () => [0],
    retrieveCandidates: async () => [],
    classifyRelationship: async () => {
      classifications += 1;
      return output(0.99);
    },
  });

  const result = await runDuplicateTriage(graph, draft);
  assert.equal(result.status, "continue");
  assert.equal(classifications, 0);
});

test("provider failures fail open without retries", async () => {
  let attempts = 0;
  const graph = createDuplicateTriageGraph({
    generateEmbedding: async () => {
      attempts += 1;
      throw new Error("provider secret detail");
    },
    retrieveCandidates: async () => [candidate],
    classifyRelationship: async () => output(0.99),
  });

  assert.deepEqual(await runDuplicateTriage(graph, draft), {
    status: "unavailable",
  });
  assert.equal(attempts, 1);
});

test("malformed and semantically invalid structured output fails open", async () => {
  for (const invalid of [
    { relationship: "duplicate" },
    { ...output(0.9), matchedRequestId: "unknown" },
    { ...output(Number.NaN) },
  ]) {
    const graph = createDuplicateTriageGraph({
      generateEmbedding: async () => [0],
      retrieveCandidates: async () => [candidate],
      classifyRelationship: async () => invalid,
    });

    assert.deepEqual(await runDuplicateTriage(graph, draft), {
      status: "unavailable",
    });
  }
});

test("the shared deadline reduces the budget passed to later calls", async () => {
  let clock = 0;
  let retrievalBudget = 0;
  const graph = createDuplicateTriageGraph({
    now: () => clock,
    generateEmbedding: async (_draft, timeoutMs) => {
      assert.equal(timeoutMs, 3000);
      clock = 7600;
      return [0];
    },
    retrieveCandidates: async (_embedding, timeoutMs) => {
      retrievalBudget = timeoutMs;
      return [];
    },
    classifyRelationship: async () => output(0.99),
  });

  await runDuplicateTriage(graph, draft, () => 0);
  assert.equal(retrievalBudget, 400);
  assert.equal(remainingBudget(8000, 5000, 4000), 4000);
  assert.throws(() => remainingBudget(8000, 5000, 8000), /expired/);
});

test("OpenAI classification uses structured output, no reasoning effort, and no retries", async () => {
  let body: Record<string, unknown> | undefined;
  let options: Record<string, unknown> | undefined;
  const client = {
    responses: {
      parse: async (
        requestBody: Record<string, unknown>,
        requestOptions: Record<string, unknown>,
      ) => {
        body = requestBody;
        options = requestOptions;
        return { output_parsed: output(0.9) };
      },
    },
  } as unknown as Parameters<typeof classifyWithOpenAI>[0];

  await classifyWithOpenAI(client, draft, [candidate], 125);
  assert.deepEqual(body?.reasoning, { effort: "none" });
  assert.ok((body?.text as { format?: unknown }).format);
  assert.equal(options?.maxRetries, 0);
  assert.equal(options?.timeout, 125);
});
