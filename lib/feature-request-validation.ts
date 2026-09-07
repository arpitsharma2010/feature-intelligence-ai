import { z } from "zod";

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
};

export type SupportFeatureRequestState = {
  message: string | null;
};
