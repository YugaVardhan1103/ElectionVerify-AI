import { GeminiProvider } from "./geminiProvider.js";
import { OpenAiProvider } from "./openaiProvider.js";
import { UnconfiguredProvider } from "./unconfiguredProvider.js";
import { env } from "../../config/environment.js";

/**
 * AI Provider Factory
 * Resolves the appropriate verification provider adapter based on configuration and available keys.
 *
 * @returns {import("./baseAiProvider.js").BaseAiProvider}
 */
export function getAiProvider() {
  const providerPreference = (env.AI_PROVIDER || "auto").toLowerCase();

  if (providerPreference === "gemini") {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) return gemini;
  }

  if (providerPreference === "openai") {
    const openai = new OpenAiProvider();
    if (openai.isConfigured()) return openai;
  }

  if (providerPreference === "auto") {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) return gemini;

    const openai = new OpenAiProvider();
    if (openai.isConfigured()) return openai;
  }

  // Fallback to unconfigured provider (cleanly handles missing credentials)
  return new UnconfiguredProvider();
}

export default getAiProvider;
