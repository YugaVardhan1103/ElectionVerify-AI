import { BaseAiProvider } from "./baseAiProvider.js";
import { VERDICTS } from "../../config/constants.js";

/**
 * Unconfigured AI Provider
 *
 * Used when no external LLM credentials (GEMINI_API_KEY or OPENAI_API_KEY) are configured.
 * Instead of fabricating fake verification or crashing, it produces an explicit
 * "INSUFFICIENT_EVIDENCE" finding with a transparent administrative notice,
 * automatically flagging the claim for human review.
 */
export class UnconfiguredProvider extends BaseAiProvider {
  constructor() {
    super("unconfigured");
  }

  isConfigured() {
    return false;
  }

  async verifyClaim({ claimText, context, language, evidence = [] }) {
    const startTime = Date.now();

    const summary =
      "Automated verification pipeline requires external AI provider configuration. No AI API keys (GEMINI_API_KEY or OPENAI_API_KEY) are configured on this server.";

    const assessment =
      `The claim "${claimText.slice(0, 150)}..." has been received into the ElectionVerify AI platform. ` +
      `Because external AI verification credentials are not configured in the backend environment, automated semantic reasoning could not be executed. ` +
      `In adherence to our strict transparency guidelines, this record has been marked with the canonical verdict '${VERDICTS.INSUFFICIENT_EVIDENCE.label}' ` +
      `and queued for human reviewer triage.`;

    return {
      verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id,
      summary,
      assessment,
      evidenceAssessment:
        "Automated evidence reasoning paused pending AI API key configuration.",
      supportingEvidence: [],
      contradictingEvidence: [],
      aiMetadata: {
        provider: "unconfigured",
        model: "none",
        executionTimeMs: Date.now() - startTime,
        tokenUsage: { prompt: 0, completion: 0, total: 0 },
        isConfigured: false,
        verificationDate: new Date(),
      },
    };
  }
}

export default UnconfiguredProvider;
