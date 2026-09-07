import OpenAI from "openai";

import { AI_TRIAGE_CONFIG } from "@/lib/ai/config";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("AI triage is unavailable.");
  }

  client ??= new OpenAI({ apiKey, maxRetries: AI_TRIAGE_CONFIG.maxRetries });
  return client;
}
