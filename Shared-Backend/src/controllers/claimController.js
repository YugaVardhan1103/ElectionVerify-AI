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
    const isPublic =
      req.body.isPublic === true &&
      req.user &&
      (req.user.role === "admin" || req.user.role === "reviewer");

    const claim = await claimService.submitClaim({
      claimText,
      sourceUrl,
      language,
      context,
      userId,
      categoryTags,
      isPublic,
    });

    // Automatically run verification pipeline synchronously to comply with Vercel serverless lifecycle,
    // avoiding unawaited background promises that freeze upon response termination.
    const autoVerify = req.query.autoVerify !== "false" && req.body.autoVerify !== false;
    let verificationResult = null;

    if (autoVerify) {
      try {
        // Enforce a 12-second serverless timeout guard so slow network searches do not block HTTP response
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Verification pipeline timed out")), 12000)
        );

        verificationResult = await Promise.race([
          verificationService.runVerificationPipeline(claim._id),
          timeoutPromise,
        ]);
      } catch (pipelineErr) {
        // Log notice; the claim is already persisted safely in MongoDB with status UNDER_REVIEW
        console.warn(
          `[Verification Notice] Automated verification deferred for claim ${claim._id}:`,
          pipelineErr.message
        );
      }
    }

    const responseClaim = verificationResult ? verificationResult.claim : claim;

    res.status(201).json({
      success: true,
      message: verificationResult
        ? "Claim submitted and verified successfully."
        : "Claim submitted successfully. Verification is in progress.",
      data: {
        claim: responseClaim,
        report: verificationResult ? verificationResult.report : null,
      },
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
    const result = await claimService.getClaims(req.query, req.user);
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
    const scope = req.query.scope || (req.query.mine === "true" ? "user" : "platform");
    const stats = await claimService.getClaimStats(req.user, scope);
    const userStats = req.user ? await claimService.getClaimStats(req.user, "user") : null;

    res.status(200).json({
      success: true,
      data: {
        stats,
        userStats,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Claim Details by ID (enforces visibility & ownership)
 * GET /api/claims/:id
 */
export async function getClaimById(req, res, next) {
  try {
    const claim = await claimService.getClaimById(req.params.id, req.user);
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

/**
 * Update Claim Details (owner or admin only)
 * PUT /api/claims/:id
 */
export async function updateClaim(req, res, next) {
  try {
    const claim = await claimService.updateClaim(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "Claim updated successfully.",
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a Claim (owner or admin only)
 * DELETE /api/claims/:id
 */
export async function deleteClaim(req, res, next) {
  try {
    const result = await claimService.deleteClaim(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
