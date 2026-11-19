import { verificationService } from "../services/verificationService.js";
import { Claim } from "../models/Claim.js";
import { CLAIM_STATUS, VERDICTS, REVIEW_STATUS, USER_ROLES } from "../config/constants.js";

/**
 * Trigger AI Verification Pipeline for a Claim
 * POST /api/verification/claims/:id/verify
 */
export async function triggerVerification(req, res, next) {
  try {
    const claimId = req.params.id;
    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: `Claim not found with ID: ${claimId}`,
      });
    }

    // Role check: Reviewer, Admin, or the original submitter of the claim
    const isPrivileged =
      req.user &&
      (req.user.role === USER_ROLES.REVIEWER || req.user.role === USER_ROLES.ADMIN);
    const isOwner =
      req.user &&
      claim.submittedBy &&
      claim.submittedBy.toString() === req.user._id.toString();

    if (!isPrivileged && !isOwner) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to trigger verification for this claim.",
      });
    }

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
    const reviewerName = req.user.name || "Authorized Reviewer";
    const { verdictId, notes, decision, isApproved } = req.body;

    const result = await verificationService.applyHumanReview({
      claimId,
      reviewerId,
      reviewerName,
      decision,
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
    const reviewStatusFilter = req.query.reviewStatus;

    let filter = {
      $or: [
        { status: CLAIM_STATUS.UNDER_REVIEW },
        { verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id },
        { reviewStatus: REVIEW_STATUS.AWAITING_REVIEW },
        { reviewStatus: REVIEW_STATUS.REQUIRES_FURTHER_INVESTIGATION },
      ],
    };

    if (reviewStatusFilter && reviewStatusFilter !== "ALL") {
      filter = { reviewStatus: reviewStatusFilter };
    }

    const [rawClaims, total] = await Promise.all([
      Claim.find(filter)
        .populate("verificationReport")
        .sort({ submittedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(filter),
    ]);

    const claims = rawClaims.map((c) => ({
      ...c,
      id: c._id ? c._id.toString() : c.id,
    }));

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
