
import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";
import { VerificationReport } from "../models/VerificationReport.js";
import { getAiProvider } from "./ai/aiProviderFactory.js";
import { evidenceRetrievalService } from "./evidenceRetrievalService.js";
import {
  CLAIM_STATUS,
  VERDICTS,
  CANONICAL_VERDICT_IDS,
  REVIEW_STATUS,
} from "../config/constants.js";

function normalizeSourceUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;

    for (const key of [...url.searchParams.keys()]) {
      if (
        key.toLowerCase().startsWith("utm_") ||
        ["fbclid", "gclid"].includes(key.toLowerCase())
      ) {
        url.searchParams.delete(key);
      }
    }

    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function validateAiOutcome(aiOutcome, sources) {
  const insufficientId = VERDICTS.INSUFFICIENT_EVIDENCE.id;

  const fallback = {
    verdictId: insufficientId,
    summary: "Automated verification could not establish a reliable finding.",
    assessment:
      "The AI response did not satisfy the platform's evidence validation requirements. Human review is required.",
    evidenceAssessment: "Evidence validation was unsuccessful.",
    supportingEvidence: [],
    contradictingEvidence: [],
    aiMetadata: aiOutcome?.aiMetadata || {
      provider: "unknown",
      model: "unknown",
      executionTimeMs: 0,
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      isConfigured: false,
      verificationDate: new Date(),
    },
  };

  if (
    !aiOutcome ||
    !CANONICAL_VERDICT_IDS.includes(aiOutcome.verdictId)
  ) {
    return fallback;
  }

  if (
    typeof aiOutcome.summary !== "string" ||
    !aiOutcome.summary.trim() ||
    typeof aiOutcome.assessment !== "string" ||
    !aiOutcome.assessment.trim() ||
    !aiOutcome.aiMetadata ||
    aiOutcome.aiMetadata.isConfigured !== true
  ) {
    return fallback;
  }

  if (
    !Array.isArray(aiOutcome.supportingEvidence) ||
    !Array.isArray(aiOutcome.contradictingEvidence)
  ) {
    return fallback;
  }

  const sourceMap = new Map();

  for (const source of sources) {
    const url = normalizeSourceUrl(source.url);
    if (url && !sourceMap.has(url)) {
      sourceMap.set(url, source);
    }
  }

  function validateCitations(items) {
    const validated = [];
    const seen = new Set();

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return null;
      }

      const url = normalizeSourceUrl(item.sourceUrl);

      if (!url || !sourceMap.has(url)) {
        return null;
      }

      if (seen.has(url)) continue;
      seen.add(url);

      const source = sourceMap.get(url);

      validated.push({
        title: source.title || "Untitled Source",
        description:
          typeof item.description === "string"
            ? item.description.trim()
            : "",
        sourceUrl: url,
        publisher: source.publisher || "Unknown",
        publicationDate: source.publicationDate || null,
        relevance:
          typeof item.relevance === "string"
            ? item.relevance.trim()
            : "",
      });
    }

    return validated;
  }

  const supporting = validateCitations(
    aiOutcome.supportingEvidence
  );

  const contradicting = validateCitations(
    aiOutcome.contradictingEvidence
  );

  if (supporting === null || contradicting === null) {
    return fallback;
  }

  const verdict = aiOutcome.verdictId;

  // Require evidence appropriate to the direction of the verdict.
  if (
    verdict === VERDICTS.SUPPORTED.id &&
    supporting.length === 0
  ) {
    return fallback;
  }

  if (
    verdict === VERDICTS.CONTRADICTED.id &&
    contradicting.length === 0
  ) {
    return fallback;
  }

  if (
    verdict === VERDICTS.PARTIALLY_SUPPORTED.id &&
    (supporting.length === 0 || contradicting.length === 0)
  ) {
    return fallback;
  }

  if (
    verdict === VERDICTS.MISLEADING_CONTEXT.id &&
    supporting.length === 0
  ) {
    return fallback;
  }

  if (
    verdict !== insufficientId &&
    supporting.length + contradicting.length === 0
  ) {
    return fallback;
  }

  return {
    ...aiOutcome,
    supportingEvidence: supporting,
    contradictingEvidence: contradicting,
  };
}

// In-flight verification tracking map to deduplicate concurrent requests for the same claim
const activeVerifications = new Map();

/**
 * ElectionVerify AI - Verification Pipeline Service
 */
export class VerificationService {
  async runVerificationPipeline(claimId) {
    if (!claimId || !mongoose.isValidObjectId(claimId)) {
      const error = new Error(
        `Invalid claim identifier format: '${claimId}'`
      );
      error.statusCode = 400;
      throw error;
    }

    const key = claimId.toString();

    // Re-use active pipeline execution to prevent duplicate concurrent runs
    if (activeVerifications.has(key)) {
      return await activeVerifications.get(key);
    }

    const executionPromise = (async () => {
      const claim = await Claim.findById(claimId);

      if (!claim) {
        const error = new Error(
          `Claim not found with ID: ${claimId}`
        );
        error.statusCode = 404;
        throw error;
      }

      claim.status = CLAIM_STATUS.IN_VERIFICATION;
      await claim.save();

      try {
        // Step 1: Retrieve external evidence.
        const retrievalResult =
          await evidenceRetrievalService.retrieveEvidence({
            claimText: claim.claimText,
            context: claim.context,
          });

        const sources = Array.isArray(retrievalResult.sources)
          ? retrievalResult.sources
          : [];

        // Step 2: Run AI analysis.
        const aiProvider = getAiProvider();

        const rawOutcome = await aiProvider.verifyClaim({
          claimText: claim.claimText,
          context: claim.context,
          language: claim.language,
          evidence: sources,
        });

        // Step 3: Independently validate AI output.
        let aiOutcome = validateAiOutcome(rawOutcome, sources);

        // Do not allow an unconfigured provider or empty sources to produce a completed claim.
        if (
          !aiProvider.isConfigured() ||
          aiOutcome.aiMetadata?.isConfigured !== true ||
          sources.length === 0
        ) {
          aiOutcome = {
            ...aiOutcome,
            verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id,
            summary:
              "Automated verification could not be completed because usable evidence or an AI provider was unavailable.",
            assessment:
              "The claim requires review by an authorized human reviewer. No definitive automated finding has been established.",
            supportingEvidence: [],
            contradictingEvidence: [],
          };
        }

        // Step 4: Persist the verification report while strictly preserving any existing human reviews.
        let report = await VerificationReport.findOne({
          claim: claim._id,
        });

        const reportData = {
          claim: claim._id,
          verdictId: aiOutcome.verdictId,
          originalAiVerdictId: aiOutcome.verdictId,
          finalVerdictId: report?.humanReview?.isReviewed ? report.finalVerdictId : aiOutcome.verdictId,
          reviewStatus: report?.humanReview?.isReviewed ? report.reviewStatus : REVIEW_STATUS.AWAITING_REVIEW,
          summary: aiOutcome.summary,
          assessment: aiOutcome.assessment,
          evidenceAssessment: aiOutcome.evidenceAssessment || "",
          supportingEvidence: aiOutcome.supportingEvidence,
          contradictingEvidence: aiOutcome.contradictingEvidence,
          sources,
          aiMetadata: aiOutcome.aiMetadata,
        };

        if (report) {
          // If human review has already occurred, preserve its final verdict
          if (report.humanReview?.isReviewed) {
            reportData.verdictId = report.finalVerdictId;
          }
          Object.assign(report, reportData);
          await report.save();
        } else {
          report = await VerificationReport.create(reportData);
        }

        // Step 5: Update claim status.
        claim.verificationReport = report._id;
        claim.verdictId = report.verdictId;
        claim.reviewStatus = report.reviewStatus;

        if (
          report.verdictId ===
          VERDICTS.INSUFFICIENT_EVIDENCE.id
        ) {
          claim.status = CLAIM_STATUS.UNDER_REVIEW;
        } else {
          claim.status = CLAIM_STATUS.COMPLETED;
        }

        await claim.save();

        return {
          claim,
          report,
        };
      } catch (error) {
        claim.status = CLAIM_STATUS.UNDER_REVIEW;
        await claim.save();
        throw error;
      }
    })();

    activeVerifications.set(key, executionPromise);
    try {
      return await executionPromise;
    } finally {
      activeVerifications.delete(key);
    }
  }

  async applyHumanReview({
    claimId,
    reviewerId,
    reviewerName = "Authorized Reviewer",
    decision,
    verdictId,
    notes = "",
    isApproved = true,
  }) {
    if (verdictId && !CANONICAL_VERDICT_IDS.includes(verdictId)) {
      const error = new Error(
        `Invalid verdictId: '${verdictId}'. Must be one of [${CANONICAL_VERDICT_IDS.join(", ")}].`
      );
      error.statusCode = 400;
      throw error;
    }

    if (!claimId || !mongoose.isValidObjectId(claimId)) {
      const error = new Error(
        `Invalid claim identifier format: '${claimId}'`
      );
      error.statusCode = 400;
      throw error;
    }

    const claim = await Claim.findById(claimId);

    if (!claim) {
      const error = new Error(
        `Claim not found with ID: ${claimId}`
      );
      error.statusCode = 404;
      throw error;
    }

    // Determine review decision
    let effectiveDecision = decision;
    if (!effectiveDecision) {
      if (verdictId && claim.verdictId && verdictId !== claim.verdictId) {
        effectiveDecision = REVIEW_STATUS.REVISED;
      } else if (isApproved === false) {
        effectiveDecision = REVIEW_STATUS.REVISED;
      } else {
        effectiveDecision = REVIEW_STATUS.APPROVED;
      }
    }

    let report = await VerificationReport.findOne({
      claim: claim._id,
    });

    if (!report) {
      const fallbackVerdict = verdictId || VERDICTS.INSUFFICIENT_EVIDENCE.id;
      report = new VerificationReport({
        claim: claim._id,
        verdictId: fallbackVerdict,
        originalAiVerdictId: fallbackVerdict,
        finalVerdictId: fallbackVerdict,
        reviewStatus: effectiveDecision,
        summary: `Human review verdict: ${VERDICTS[fallbackVerdict]?.label || fallbackVerdict}`,
        assessment: notes || "Review completed by authorized human reviewer.",
        evidenceAssessment:
          "Review completed by authorized human reviewer.",
        supportingEvidence: [],
        contradictingEvidence: [],
        sources: [],
        aiMetadata: {
          provider: "human-override",
          model: "human",
          isConfigured: true,
          verificationDate: new Date(),
        },
      });
    }

    let finalVerdict = report.originalAiVerdictId || report.verdictId;

    if (effectiveDecision === REVIEW_STATUS.REVISED) {
      if (!verdictId) {
        const error = new Error("A revised verdictId is required when revising the verification outcome.");
        error.statusCode = 400;
        throw error;
      }
      finalVerdict = verdictId;
    } else if (effectiveDecision === REVIEW_STATUS.APPROVED) {
      finalVerdict = verdictId || report.originalAiVerdictId || report.verdictId;
    } else if (effectiveDecision === REVIEW_STATUS.REQUIRES_FURTHER_INVESTIGATION) {
      finalVerdict = report.originalAiVerdictId || report.verdictId;
    }

    report.finalVerdictId = finalVerdict;
    report.verdictId = finalVerdict;
    report.reviewStatus = effectiveDecision;
    report.humanReview = {
      isReviewed: true,
      decision: effectiveDecision,
      reviewer: reviewerId,
      reviewerName: reviewerName || "Authorized Reviewer",
      revisedVerdictId: effectiveDecision === REVIEW_STATUS.REVISED ? verdictId : null,
      notes: typeof notes === "string" ? notes.trim() : "",
      reviewedAt: new Date(),
    };

    await report.save();

    claim.verdictId = finalVerdict;
    claim.verificationReport = report._id;
    claim.reviewStatus = effectiveDecision;

    if (effectiveDecision === REVIEW_STATUS.REQUIRES_FURTHER_INVESTIGATION) {
      claim.status = CLAIM_STATUS.UNDER_REVIEW;
    } else if (isApproved === false) {
      claim.status = CLAIM_STATUS.REJECTED;
    } else {
      claim.status = CLAIM_STATUS.COMPLETED;
    }

    await claim.save();

    return {
      claim,
      report,
    };
  }
}

export const verificationService = new VerificationService();
export default verificationService;
