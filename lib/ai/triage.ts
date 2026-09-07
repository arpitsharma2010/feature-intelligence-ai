import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";
import { z } from "zod";

import { AI_TRIAGE_CONFIG } from "@/lib/ai/config";
import { withTimeout } from "@/lib/ai/embedding";

export type TriageDraft = {
  title: string;
  description: string;
};

export type TriageCandidate = {
  id: string;
  title: string;
  description: string;
  supportCount: number;
  similarity: number;
};

const classifierOutputSchema = z.object({
  relationship: z.enum(["duplicate", "related", "distinct"]),
  matchedRequestId: z.string().nullable(),
  confidence: z.number(),
  rationale: z.string().max(300),
});

export type ClassifierOutput = z.infer<typeof classifierOutputSchema>;

export type DuplicateSuggestion = {
  matchedRequestId: string;
  title: string;
  description: string;
  supportCount: number;
  confidence: number;
  rationale: string;
};

export type TriageResult =
  | { status: "suggestion"; suggestion: DuplicateSuggestion }
  | { status: "continue" }
  | { status: "unavailable" };

export type TriageDependencies = {
  generateEmbedding: (draft: TriageDraft, timeoutMs: number) => Promise<number[]>;
  retrieveCandidates: (
    embedding: number[],
    timeoutMs: number,
  ) => Promise<TriageCandidate[]>;
  classifyRelationship: (
    draft: TriageDraft,
    candidates: TriageCandidate[],
    timeoutMs: number,
  ) => Promise<unknown>;
  now?: () => number;
};

const TriageState = Annotation.Root({
  draft: Annotation<TriageDraft>(),
  deadlineAt: Annotation<number>(),
  embedding: Annotation<number[] | undefined>(),
  candidates: Annotation<TriageCandidate[] | undefined>(),
  classification: Annotation<ClassifierOutput | undefined>(),
  result: Annotation<TriageResult | undefined>(),
});

export function createDuplicateTriageGraph(dependencies: TriageDependencies) {
  const now = dependencies.now ?? Date.now;

  return new StateGraph(TriageState)
    .addNode("generate_embedding", async (state) => ({
      embedding: await dependencies.generateEmbedding(
        state.draft,
        remainingBudget(
          state.deadlineAt,
          AI_TRIAGE_CONFIG.embeddingTimeoutMs,
          now(),
        ),
      ),
    }))
    .addNode("retrieve_candidates", async (state) => ({
      candidates: await withTimeout(
        dependencies.retrieveCandidates(
          state.embedding ?? [],
          remainingBudget(state.deadlineAt, Infinity, now()),
        ),
        remainingBudget(state.deadlineAt, Infinity, now()),
      ),
    }))
    .addNode("classify_relationship", async (state) => ({
      classification: validateClassifierOutput(
        await dependencies.classifyRelationship(
          state.draft,
          state.candidates ?? [],
          remainingBudget(
            state.deadlineAt,
            AI_TRIAGE_CONFIG.classificationTimeoutMs,
            now(),
          ),
        ),
        state.candidates ?? [],
      ),
    }))
    .addNode("recommend_duplicate", (state) => {
      const classification = state.classification;
      const candidate = state.candidates?.find(
        (item) => item.id === classification?.matchedRequestId,
      );

      if (!classification || !candidate) {
        return { result: { status: "continue" } as TriageResult };
      }

      return {
        result: {
          status: "suggestion",
          suggestion: {
            matchedRequestId: candidate.id,
            title: candidate.title,
            description: candidate.description,
            supportCount: candidate.supportCount,
            confidence: classification.confidence,
            rationale: classification.rationale,
          },
        } as TriageResult,
      };
    })
    .addNode("continue_submission", () => ({
      result: { status: "continue" } as TriageResult,
    }))
    .addEdge(START, "generate_embedding")
    .addEdge("generate_embedding", "retrieve_candidates")
    .addConditionalEdges(
      "retrieve_candidates",
      (state) =>
        state.candidates && state.candidates.length > 0
          ? "classify_relationship"
          : "continue_submission",
    )
    .addConditionalEdges("classify_relationship", (state) =>
      shouldRecommendDuplicate(state.classification)
        ? "recommend_duplicate"
        : "continue_submission",
    )
    .addEdge("recommend_duplicate", END)
    .addEdge("continue_submission", END)
    .compile();
}

export async function runDuplicateTriage(
  graph: ReturnType<typeof createDuplicateTriageGraph>,
  draft: TriageDraft,
): Promise<TriageResult> {
  try {
    const output = await graph.invoke({
      draft,
      deadlineAt: Date.now() + AI_TRIAGE_CONFIG.totalTimeoutMs,
    });
    return output.result ?? { status: "unavailable" };
  } catch (error) {
    console.warn("AI duplicate triage is unavailable.", safeErrorName(error));
    return { status: "unavailable" };
  }
}

export function remainingBudget(deadlineAt: number, capMs: number, now: number) {
  const remaining = deadlineAt - now;
  const budget = Math.min(capMs, remaining);

  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error("The AI triage deadline has expired.");
  }

  return budget;
}

export function validateClassifierOutput(
  value: unknown,
  candidates: TriageCandidate[],
): ClassifierOutput {
  const parsed = classifierOutputSchema.parse(value);

  if (!Number.isFinite(parsed.confidence) || parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error("Classifier confidence is invalid.");
  }

  if (parsed.rationale.trim().length === 0) {
    throw new Error("Classifier rationale is invalid.");
  }

  if (parsed.relationship === "distinct") {
    if (parsed.matchedRequestId !== null) {
      throw new Error("Distinct results cannot identify a candidate.");
    }
    return { ...parsed, rationale: parsed.rationale.trim() };
  }

  if (!candidates.some((candidate) => candidate.id === parsed.matchedRequestId)) {
    throw new Error("Classifier selected an unknown candidate.");
  }

  return { ...parsed, rationale: parsed.rationale.trim() };
}

export function shouldRecommendDuplicate(
  classification: ClassifierOutput | undefined,
) {
  return (
    classification?.relationship === "duplicate" &&
    classification.confidence >= AI_TRIAGE_CONFIG.duplicateThreshold
  );
}

export async function classifyWithOpenAI(
  client: Pick<OpenAI, "responses">,
  draft: TriageDraft,
  candidates: TriageCandidate[],
  timeoutMs: number,
) {
  const response = await withTimeout(
    client.responses.parse(
      {
        model: AI_TRIAGE_CONFIG.classifierModel,
        reasoning: { effort: AI_TRIAGE_CONFIG.reasoningEffort },
        input: [
          {
            role: "system",
            content:
              "Classify a proposed feature request against retrieved requests. A duplicate asks for substantially the same capability and user outcome. Related requests overlap in topic or need but require meaningfully different work or outcomes. Distinct requests do not materially overlap. Return a short rationale based only on observable similarities; do not provide hidden reasoning.",
          },
          {
            role: "user",
            content: JSON.stringify({ draft, candidates }),
          },
        ],
        text: {
          format: zodTextFormat(classifierOutputSchema, "duplicate_triage"),
        },
      },
      { maxRetries: AI_TRIAGE_CONFIG.maxRetries, timeout: timeoutMs },
    ),
    timeoutMs,
  );

  if (!response.output_parsed) {
    throw new Error("Classifier output was unavailable.");
  }

  return response.output_parsed;
}

function safeErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}
