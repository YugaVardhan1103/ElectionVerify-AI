import { verificationService } from "../services/verificationService.js";
import { Claim } from "../models/Claim.js";
import { CLAIM_STATUS, VERDICTS } from "../config/constants.js";

/**
 * Trigger AI Verification Pipeline for a Claim
 * POST /api/verification/claims/:id/verify
 */
export async function triggerVerification(req, res, next) {
  try {
    const claimId = req.params.id;
    const result = await verificationService.runVerificationPipeline(claimId);

    res.status(200).json({
      success: true,
      message: "Verification pipeline completed.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit Human Expert Review for a Claim
 * POST /api/verification/claims/:id/review
 */
export async function submitHumanReview(req, res, next) {
  try {
    const claimId = req.params.id;
    const reviewerId = req.user._id;
    const { verdictId, notes, isApproved } = req.body;

    const result = await verificationService.applyHumanReview({
      claimId,
      reviewerId,
      verdictId,
      notes,
      isApproved: isApproved !== false,
    });

    res.status(200).json({
      success: true,
      message: "Human review recorded successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Claims Pending Human Review
 * GET /api/verification/pending
 */
export async function getPendingReviews(req, res, next) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { status: CLAIM_STATUS.UNDER_REVIEW },
        { verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id },
      ],
    };

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate("verificationReport")
        .sort({ submittedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        claims,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
