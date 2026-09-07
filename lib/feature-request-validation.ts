import { z } from "zod";

import type { DuplicateSuggestion } from "@/lib/ai/triage";

export const featureRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title for your request.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Describe the problem or improvement you have in mind.")
    .max(5000, "Description must be 5,000 characters or fewer."),
});

export type FeatureRequestFormValues = {
  title: string;
  description: string;
};

export type CreateFeatureRequestState = {
  values: FeatureRequestFormValues;
  fieldErrors: Partial<Record<keyof FeatureRequestFormValues, string[]>>;
  message: string | null;
  suggestion?: DuplicateSuggestion;
};

export function createSuggestionState(
  values: FeatureRequestFormValues,
  suggestion: DuplicateSuggestion,
): CreateFeatureRequestState {
  return {
    values,
    fieldErrors: {},
    message: null,
    suggestion: {
      matchedRequestId: suggestion.matchedRequestId,
      title: suggestion.title,
      description: suggestion.description,
      supportCount: suggestion.supportCount,
      confidence: suggestion.confidence,
      rationale: suggestion.rationale,
    },
  };
}

export type SupportFeatureRequestState = {
  message: string | null;
};
