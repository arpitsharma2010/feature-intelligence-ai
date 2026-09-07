import "server-only";

import { Prisma } from "@prisma/client";

import { AI_TRIAGE_CONFIG } from "@/lib/ai/config";
import { formatFeatureRequestInput, generateEmbedding } from "@/lib/ai/embedding";
import { getOpenAIClient } from "@/lib/ai/openai-client";
import {
  classifyWithOpenAI,
  createDuplicateTriageGraph,
  runDuplicateTriage,
  type TriageCandidate,
  type TriageDraft,
} from "@/lib/ai/triage";
import { prisma } from "@/lib/prisma";

const graph = createDuplicateTriageGraph({
  async generateEmbedding(draft, timeoutMs) {
    return generateEmbedding(
      getOpenAIClient(),
      formatFeatureRequestInput(draft),
      timeoutMs,
    );
  },
  async retrieveCandidates(embedding) {
    const vector = `[${embedding.join(",")}]`;
    return prisma.$queryRaw<TriageCandidate[]>(
      Prisma.sql`SELECT
          "id",
          "title",
          "description",
          "supportCount",
          1 - ("embedding" <=> ${vector}::vector) AS "similarity"
        FROM "FeatureRequest"
        WHERE "embedding" IS NOT NULL
        ORDER BY "embedding" <=> ${vector}::vector
        LIMIT ${AI_TRIAGE_CONFIG.candidateLimit}`,
    );
  },
  async classifyRelationship(draft, candidates, timeoutMs) {
    return classifyWithOpenAI(getOpenAIClient(), draft, candidates, timeoutMs);
  },
});

export function triageFeatureRequest(draft: TriageDraft) {
  return runDuplicateTriage(graph, draft);
}
