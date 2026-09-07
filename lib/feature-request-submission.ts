import type {
  DuplicateSuggestion,
  TriageDraft,
  TriageResult,
} from "@/lib/ai/triage";

export type SubmissionIntent =
  | "initial"
  | "support-existing"
  | "create-separately";

export type SubmissionDependencies = {
  triage: (draft: TriageDraft) => Promise<TriageResult>;
  enrichEmbedding: (draft: TriageDraft) => Promise<number[] | null>;
  create: (
    draft: TriageDraft,
    embedding?: number[] | null,
  ) => Promise<{ id: string }>;
  support: (id: string) => Promise<unknown>;
};

export type SubmissionResult =
  | { status: "suggestion"; suggestion: DuplicateSuggestion }
  | { status: "created"; id: string }
  | { status: "supported"; id: string };

export function createSubmissionCoordinator(dependencies: SubmissionDependencies) {
  return async function submit(options: {
    draft: TriageDraft;
    intent: SubmissionIntent;
    suggestion?: DuplicateSuggestion;
  }): Promise<SubmissionResult> {
    if (options.intent === "support-existing") {
      if (!options.suggestion) {
        throw new Error("A duplicate suggestion is required.");
      }

      await dependencies.support(options.suggestion.matchedRequestId);
      return {
        status: "supported",
        id: options.suggestion.matchedRequestId,
      };
    }

    if (options.intent === "create-separately") {
      let embedding: number[] | null = null;
      try {
        embedding = await dependencies.enrichEmbedding(options.draft);
      } catch {
        // Enrichment is best-effort and must never block an explicit override.
      }
      const request = await dependencies.create(options.draft, embedding);
      return { status: "created", id: request.id };
    }

    const triage = await dependencies.triage(options.draft);
    if (triage.status === "suggestion") {
      return triage;
    }

    const request = await dependencies.create(
      options.draft,
      triage.status === "continue" ? triage.embedding : null,
    );
    return { status: "created", id: request.id };
  };
}
