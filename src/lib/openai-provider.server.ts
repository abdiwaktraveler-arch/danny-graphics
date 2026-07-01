import { createOpenAI } from "@ai-sdk/openai";

/**
 * Direct OpenAI provider for the AI SDK.
 * Server-only — reads the OPENAI_API_KEY at call time.
 * Used so the chat route works on hosts (e.g. Vercel) where the
 * managed LOVABLE_API_KEY is not available.
 */
export function createOpenAiProvider(apiKey: string) {
  return createOpenAI({ apiKey });
}
