import assert from "node:assert/strict";
import test from "node:test";

import {
  featureRequestOrderBy,
  normalizeFeatureRequestSort,
} from "../lib/feature-request-sort";

test("recognised sort values pass through", () => {
  assert.equal(normalizeFeatureRequestSort("recent"), "recent");
  assert.equal(normalizeFeatureRequestSort("supported"), "supported");
});

test("missing or unsupported sort values fall back to recent", () => {
  for (const value of [
    undefined,
    null,
    "",
    "newest",
    "SUPPORTED",
    ["supported", "recent"],
    1,
    {},
  ]) {
    assert.equal(normalizeFeatureRequestSort(value), "recent");
  }
});

test("recent orders newest first with a deterministic tiebreak", () => {
  assert.deepEqual(featureRequestOrderBy.recent, [
    { createdAt: "desc" },
    { id: "desc" },
  ]);
});

test("supported orders by descending support count before recency", () => {
  assert.deepEqual(featureRequestOrderBy.supported, [
    { supportCount: "desc" },
    { createdAt: "desc" },
    { id: "desc" },
  ]);
});
