import assert from "node:assert/strict";
import test from "node:test";

import type { DuplicateSuggestion, TriageResult } from "../lib/ai/triage";
import { newFeatureRequestData } from "../lib/feature-requests";
import { createSubmissionCoordinator } from "../lib/feature-request-submission";

const draft = { title: "Print stylesheet", description: "Readable printed pages" };
const suggestion: DuplicateSuggestion = {
  matchedRequestId: "existing-id",
  title: "Download analytics CSV",
  description: "Export filtered dashboard data.",
  supportCount: 18,
  confidence: 0.93,
  rationale: "Both request a filtered analytics CSV export.",
};

test("a new request is created with the author's own support", () => {
  assert.deepEqual(newFeatureRequestData(draft), { ...draft, supportCount: 1 });
});

const creationFlows: Array<{ name: string; triage: TriageResult; intent: "initial" | "create-separately" }> = [
  { name: "normal non-duplicate", triage: { status: "continue" }, intent: "initial" },
  { name: "AI fail-open", triage: { status: "unavailable" }, intent: "initial" },
  { name: "create separately", triage: { status: "suggestion", suggestion }, intent: "create-separately" },
];

for (const flow of creationFlows) {
  test(`${flow.name} creation starts at one support`, async () => {
    const written: Array<{ supportCount: number }> = [];
    const submit = createSubmissionCoordinator({
      triage: async () => flow.triage,
      enrichEmbedding: async () => null,
      create: async (input) => {
        written.push(newFeatureRequestData(input));
        return { id: "new-id" };
      },
      support: async () => undefined,
    });

    assert.deepEqual(await submit({ draft, intent: flow.intent, suggestion }), {
      status: "created",
      id: "new-id",
    });
    assert.deepEqual(written.map((data) => data.supportCount), [1]);
  });
}
