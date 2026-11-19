import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";
import { CLAIM_STATUS, VERDICTS } from "../config/constants.js";

/**
 * ElectionVerify AI - Claim Service
 */
export class ClaimService {
  /**
   * Submit a new election claim.
   *
   * @param {object} params
   * @param {string} params.claimText
   * @param {string} [params.sourceUrl=""]
   * @param {string} [params.language="English"]
   * @param {string} [params.context=""]
   * @param {string} [params.userId=null]
   * @param {Array<string>} [params.categoryTags]
   * @returns {Promise<object>} Created claim
   */
  async submitClaim({
    claimText,
    sourceUrl = "",
    language = "English",
    context = "",
    userId = null,
    categoryTags = [],
  }) {
    const trimmed = claimText.trim();
    const title =
      trimmed.length > 70 ? `${trimmed.slice(0, 67)}...` : trimmed;

    const defaultTags =
      categoryTags && categoryTags.length > 0
        ? categoryTags
        : ["General Election"];

    const claim = await Claim.create({
      title,
      claimText: trimmed,
      sourceUrl: sourceUrl ? sourceUrl.trim() : "",
      language,
      context: context ? context.trim() : "",
      submittedBy: userId || null,
      status: CLAIM_STATUS.UNDER_REVIEW,
      verdictId: null, // Claims enter lifecycle without verdict
      categoryTags: defaultTags,
    });

    return claim;
  }

  /**
   * Retrieve claims with filtering, search, and pagination.
   *
   * @param {object} queryOptions
   * @returns {Promise<{ claims: Array<object>, pagination: object }>}
   */
  async getClaims(queryOptions = {}, currentUser = null) {
    const page = Math.max(1, parseInt(queryOptions.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(queryOptions.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    const conditions = [];

    // Search query on title and claimText
    if (queryOptions.searchTerm && typeof queryOptions.searchTerm === "string") {
      const searchRegex = new RegExp(queryOptions.searchTerm.trim(), "i");
      conditions.push({ $or: [{ title: searchRegex }, { claimText: searchRegex }] });
    }

    // Status filter
    if (queryOptions.status && queryOptions.status !== "ALL") {
      filter.status = queryOptions.status.toUpperCase();
    }

    // Verdict filter
    if (queryOptions.verdictId && queryOptions.verdictId !== "ALL") {
      filter.verdictId = queryOptions.verdictId.toUpperCase();
    }

    // Language filter
    if (queryOptions.language && queryOptions.language !== "ALL") {
      filter.language = queryOptions.language;
    }

    // Submitter account isolation: prevent users from seeing other accounts' in-progress submissions
    if (queryOptions.submittedBy && mongoose.isValidObjectId(queryOptions.submittedBy)) {
      conditions.push({ submittedBy: queryOptions.submittedBy });
    } else if (currentUser && currentUser.role !== "admin" && currentUser.role !== "reviewer") {
      conditions.push({
        $or: [
          { submittedBy: currentUser._id },
          { status: CLAIM_STATUS.COMPLETED },
          { submittedBy: null },
        ],
      });
    } else if (!currentUser) {
      conditions.push({
        $or: [
          { status: CLAIM_STATUS.COMPLETED },
          { submittedBy: null },
        ],
      });
    }

    if (conditions.length > 0) {
      filter.$and = conditions;
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

    return {
      claims,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieve a single claim by its MongoDB ID with full verification report.
   *
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getClaimById(id) {
    if (!id || typeof id !== "string") return null;
    const cleanId = id.trim();
    if (!mongoose.isValidObjectId(cleanId)) {
      return null;
    }
    const claim = await Claim.findById(cleanId).populate("verificationReport").lean();
    if (claim) {
      claim.id = claim._id ? claim._id.toString() : claim.id;
    }
    return claim;
  }

  /**
   * Derive aggregate verification and processing metrics.
   *
   * @returns {Promise<object>}
   */
  async getClaimStats() {
    const [totalClaims, completed, underReview, inVerification, rejected, verdictCounts] =
      await Promise.all([
        Claim.countDocuments(),
        Claim.countDocuments({ status: CLAIM_STATUS.COMPLETED }),
        Claim.countDocuments({ status: CLAIM_STATUS.UNDER_REVIEW }),
        Claim.countDocuments({ status: CLAIM_STATUS.IN_VERIFICATION }),
        Claim.countDocuments({ status: CLAIM_STATUS.REJECTED }),
        Claim.aggregate([
          { $match: { verdictId: { $ne: null } } },
          { $group: { _id: "$verdictId", count: { $sum: 1 } } },
        ]),
      ]);

    const byVerdict = {
      SUPPORTED: 0,
      CONTRADICTED: 0,
      PARTIALLY_SUPPORTED: 0,
      MISLEADING_CONTEXT: 0,
      INSUFFICIENT_EVIDENCE: 0,
    };

    verdictCounts.forEach((v) => {
      if (byVerdict[v._id] !== undefined) {
        byVerdict[v._id] = v.count;
      }
    });

    return {
      totalClaims,
      completedVerifications: completed,
      underReview,
      inVerification,
      rejected,
      byVerdict,
    };
  }
}

export const claimService = new ClaimService();
export default claimService;
