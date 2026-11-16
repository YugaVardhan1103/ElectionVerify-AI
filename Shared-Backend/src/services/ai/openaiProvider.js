import { BaseAiProvider } from "./baseAiProvider.js";
import { VERDICTS, CANONICAL_VERDICT_IDS } from "../../config/constants.js";
import { env } from "../../config/environment.js";

/**
 * OpenAI Verification Provider Adapter
 */
export class OpenAiProvider extends BaseAiProvider {
  constructor(apiKey = env.OPENAI_API_KEY, model = env.OPENAI_MODEL) {
    super("openai");
    this.apiKey = apiKey;
    this.model = model;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async verifyClaim({ claimText, context = "", language = "English", evidence = [] }) {
    if (!this.isConfigured()) {
      throw new Error("OpenAiProvider: OPENAI_API_KEY is not configured.");
    }

    const startTime = Date.now();

    const evidenceSummary =
      evidence && evidence.length > 0
        ? evidence
            .map(
              (e, idx) =>
                `[Source ${idx + 1}] Title: ${e.title}\nPublisher: ${e.publisher}\nSnippet: ${e.snippet}\nURL: ${e.url}`
            )
            .join("\n\n")
        : "No external search evidence retrieved.";

    const systemPrompt = `You are an impartial, evidence-based election verification analyst for ElectionVerify AI.
Analyze the claim against the provided evidence.
You MUST output ONLY a valid JSON object matching this schema:
{
  "verdictId": "SUPPORTED" | "CONTRADICTED" | "PARTIALLY_SUPPORTED" | "MISLEADING_CONTEXT" | "INSUFFICIENT_EVIDENCE",
  "summary": "1-2 sentence overview",
  "assessment": "2-3 paragraph objective analysis",
  "evidenceAssessment": "Short assessment of evidence quality",
  "supportingEvidence": [
    { "title": "Headline", "description": "How it supports", "sourceUrl": "URL", "publisher": "Publisher", "relevance": "Why relevant" }
  ],
  "contradictingEvidence": [
    { "title": "Headline", "description": "How it contradicts", "sourceUrl": "URL", "publisher": "Publisher", "relevance": "Why relevant" }
  ]
}

CRITICAL:
1. verdictId MUST be one of: "SUPPORTED", "CONTRADICTED", "PARTIALLY_SUPPORTED", "MISLEADING_CONTEXT", "INSUFFICIENT_EVIDENCE".
2. If evidence is inadequate, use "INSUFFICIENT_EVIDENCE".
3. NEVER fabricate evidence, citations, or URLs.`;

    const userPrompt = `CLAIM: "${claimText}"\nCONTEXT: ${context || "None"}\nLANGUAGE: ${language}\nEVIDENCE:\n${evidenceSummary}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = JSON.parse(messageContent);

    let verdictId = parsed.verdictId;
    if (!CANONICAL_VERDICT_IDS.includes(verdictId)) {
      verdictId = VERDICTS.INSUFFICIENT_EVIDENCE.id;
    }

    return {
      verdictId,
      summary: parsed.summary || "Analysis completed.",
      assessment: parsed.assessment || "No detailed assessment provided.",
      evidenceAssessment: parsed.evidenceAssessment || "",
      supportingEvidence: Array.isArray(parsed.supportingEvidence)
        ? parsed.supportingEvidence
        : [],
      contradictingEvidence: Array.isArray(parsed.contradictingEvidence)
        ? parsed.contradictingEvidence
        : [],
      aiMetadata: {
        provider: "openai",
        model: this.model,
        executionTimeMs: Date.now() - startTime,
        tokenUsage: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
        isConfigured: true,
        verificationDate: new Date(),
      },
    };
  }
}

export default OpenAiProvider;
