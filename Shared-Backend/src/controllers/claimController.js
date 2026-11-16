import { claimService } from "../services/claimService.js";
import { verificationService } from "../services/verificationService.js";

/**
 * Submit an Election Claim
 * POST /api/claims
 */
export async function submitClaim(req, res, next) {
  try {
    const { claimText, sourceUrl, language, context, categoryTags } = req.body;
    const userId = req.user ? req.user._id : null;

    const claim = await claimService.submitClaim({
      claimText,
      sourceUrl,
      language,
      context,
      userId,
      categoryTags,
    });

    // Optionally trigger background verification pipeline asynchronously if requested
    const autoVerify = req.query.autoVerify === "true";
    if (autoVerify) {
      verificationService.runVerificationPipeline(claim._id).catch((err) => {
        console.error(`[Background Verification] Failed for claim ${claim._id}:`, err);
      });
    }

    res.status(201).json({
      success: true,
      message: "Claim submitted successfully for verification.",
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Claims with Search, Filtering & Pagination
 * GET /api/claims
 */
export async function getClaims(req, res, next) {
  try {
    const result = await claimService.getClaims(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Aggregate Claim Metrics
 * GET /api/claims/stats
 */
export async function getClaimStats(req, res, next) {
  try {
    const stats = await claimService.getClaimStats();
    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Claim Details by ID
 * GET /api/claims/:id
 */
export async function getClaimById(req, res, next) {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: "Claim not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
}
