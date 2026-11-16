/**
 * Abstract Base Class for AI Verification Providers
 */
export class BaseAiProvider {
  constructor(name = "base") {
    this.name = name;
  }

  /**
   * Verify an election claim against retrieved evidence.
   *
   * @param {object} params
   * @param {string} params.claimText - The statement to verify
   * @param {string} [params.context] - Additional context provided by user
   * @param {string} [params.language] - Primary language
   * @param {Array<object>} [params.evidence] - Retrieved source articles and snippets
   * @returns {Promise<object>} Standard verification outcome:
   *   {
   *     verdictId: 'SUPPORTED' | 'CONTRADICTED' | 'PARTIALLY_SUPPORTED' | 'MISLEADING_CONTEXT' | 'INSUFFICIENT_EVIDENCE',
   *     summary: string,
   *     assessment: string,
   *     evidenceAssessment: string,
   *     supportingEvidence: Array<{title, description, sourceUrl, publisher, relevance}>,
   *     contradictingEvidence: Array<{title, description, sourceUrl, publisher, relevance}>,
   *     aiMetadata: { provider, model, executionTimeMs, isConfigured, tokenUsage }
   *   }
   */
  async verifyClaim(params) {
    throw new Error("verifyClaim() must be implemented by subclass");
  }

  /**
   * Check if the provider is fully configured with required API credentials.
   *
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }
}

export default BaseAiProvider;
