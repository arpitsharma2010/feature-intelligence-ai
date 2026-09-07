import assert from "node:assert/strict";
import test from "node:test";

import type { DuplicateSuggestion } from "../lib/ai/triage";
import { createSubmissionCoordinator } from "../lib/feature-request-submission";
import { createSuggestionState } from "../lib/feature-request-validation";

const draft = { title: "CSV export", description: "Download filtered data" };
const suggestion: DuplicateSuggestion = {
  matchedRequestId: "existing-id",
  title: "Download analytics CSV",
  description: "Export filtered dashboard data.",
  supportCount: 18,
  confidence: 0.93,
  rationale: "Both request a filtered analytics CSV export.",
};

test("create separately bypasses triage and tolerates embedding failure", async () => {
  let triageCalls = 0;
  let enrichmentCalls = 0;
  const createdEmbeddings: Array<number[] | null | undefined> = [];
  const submit = createSubmissionCoordinator({
    triage: async () => {
      triageCalls += 1;
      return { status: "suggestion", suggestion };
    },
    enrichEmbedding: async () => {
      enrichmentCalls += 1;
      throw new Error("provider unavailable");
    },
    create: async (_draft, embedding) => {
      createdEmbeddings.push(embedding);
      return { id: "new-id" };
    },
    support: async () => undefined,
  });

  assert.deepEqual(
    await submit({ draft, intent: "create-separately", suggestion }),
    { status: "created", id: "new-id" },
  );
  assert.equal(triageCalls, 0);
  assert.equal(enrichmentCalls, 1);
  assert.deepEqual(createdEmbeddings, [null]);
});

test("support existing performs one atomic support call and no create", async () => {
  let supportCalls = 0;
  let createCalls = 0;
  const submit = createSubmissionCoordinator({
    triage: async () => ({ status: "continue" }),
    enrichEmbedding: async () => null,
    create: async () => {
      createCalls += 1;
      return { id: "new-id" };
    },
    support: async (id) => {
      assert.equal(id, suggestion.matchedRequestId);
      supportCalls += 1;
    },
  });

  assert.deepEqual(
    await submit({ draft, intent: "support-existing", suggestion }),
    { status: "supported", id: suggestion.matchedRequestId },
  );
  assert.equal(supportCalls, 1);
  assert.equal(createCalls, 0);
});

test("unavailable triage fails open to normal creation", async () => {
  let receivedEmbedding: number[] | null | undefined = undefined;
  const submit = createSubmissionCoordinator({
    triage: async () => ({ status: "unavailable" }),
    enrichEmbedding: async () => null,
    create: async (_draft, embedding) => {
      receivedEmbedding = embedding;
      return { id: "new-id" };
    },
    support: async () => undefined,
  });

  assert.deepEqual(await submit({ draft, intent: "initial" }), {
    status: "created",
    id: "new-id",
  });
  assert.equal(receivedEmbedding, null);
});

test("client-visible action state never includes vector fields", () => {
  const state = createSuggestionState(draft, suggestion);
  const keys: string[] = [];

  JSON.parse(JSON.stringify(state), (key, value) => {
    keys.push(key.toLowerCase());
    return value;
  });

  assert.equal(keys.includes("embedding"), false);
  assert.equal(keys.includes("vector"), false);
});
