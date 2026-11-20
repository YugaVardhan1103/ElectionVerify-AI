import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";
import { VerificationReport } from "../models/VerificationReport.js";
import { User } from "../models/User.js";
import { CLAIM_STATUS, VERDICTS } from "../config/constants.js";
import { deleteFromCloudinary } from "./cloudinaryService.js";

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
   * @param {boolean} [params.isPublic=false]
   * @returns {Promise<object>} Created claim
   */
  async submitClaim({
    claimText,
    sourceUrl = "",
    language = "English",
    context = "",
    userId = null,
    categoryTags = [],
    isPublic = false,
    imageProofs = [],
  }) {
    const trimmed = claimText.trim();
    const title =
      trimmed.length > 70 ? `${trimmed.slice(0, 67)}...` : trimmed;

    const defaultTags =
      categoryTags && categoryTags.length > 0
        ? categoryTags
        : ["General Election"];

    const validUserId =
      userId && mongoose.isValidObjectId(userId) ? userId : null;

    const sanitizedProofs = Array.isArray(imageProofs)
      ? imageProofs.slice(0, 5).map((img) => ({
          url: img.url || img.secureUrl,
          secureUrl: img.secureUrl || img.url,
          publicId: img.publicId,
          format: img.format || "",
          width: img.width || 0,
          height: img.height || 0,
          bytes: img.bytes || 0,
          originalName: img.originalName || "",
          uploadedBy: validUserId,
          createdAt: img.createdAt || new Date(),
        }))
      : [];

    const claim = await Claim.create({
      title,
      claimText: trimmed,
      sourceUrl: sourceUrl ? sourceUrl.trim() : "",
      language,
      context: context ? context.trim() : "",
      submittedBy: validUserId,
      isPublic: Boolean(isPublic),
      status: CLAIM_STATUS.UNDER_REVIEW,
      verdictId: null, // Claims enter lifecycle without verdict
      categoryTags: defaultTags,
      imageProofs: sanitizedProofs,
    });

    return claim;
  }

  /**
   * Retrieve claims with filtering, search, pagination, and strict multi-user data isolation.
   *
   * @param {object} queryOptions
   * @param {object|null} currentUser
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

    const isMineOnly =
      queryOptions.mine === "true" ||
      queryOptions.mine === true ||
      queryOptions.scope === "user";

    if (isMineOnly) {
      // User-specific history: strictly authenticated user's records
      if (!currentUser) {
        return {
          claims: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      conditions.push({ submittedBy: currentUser._id });
    } else if (currentUser && (currentUser.role === "admin" || currentUser.role === "reviewer")) {
      // Authorized Reviewer / Admin view: can inspect all submissions, or filter by specific submitter
      if (queryOptions.submittedBy && mongoose.isValidObjectId(queryOptions.submittedBy)) {
        conditions.push({ submittedBy: queryOptions.submittedBy });
      }
    } else if (currentUser) {
      // Regular Authenticated User: public registry claims + their own private submissions ONLY
      // Prevent IDOR: if client attempts ?submittedBy=<other_user_id>, enforce ownership
      if (queryOptions.submittedBy && queryOptions.submittedBy !== currentUser._id.toString()) {
        conditions.push({ submittedBy: currentUser._id });
      } else {
        conditions.push({
          $or: [
            { isPublic: true },
            { submittedBy: currentUser._id },
          ],
        });
      }
    } else {
      // Unauthenticated Guests: strictly public verified claims ONLY
      // Safely isolates unowned / private data from exposure
      conditions.push({ isPublic: true });
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
   * Enforces data isolation: private claims are only accessible to the submitter or reviewers/admins.
   *
   * @param {string} id
   * @param {object|null} currentUser
   * @returns {Promise<object|null>}
   */
  async getClaimById(id, currentUser = null) {
    if (!id || typeof id !== "string") return null;
    const cleanId = id.trim();
    if (!mongoose.isValidObjectId(cleanId)) {
      return null;
    }

    const claim = await Claim.findById(cleanId).populate("verificationReport").lean();
    if (!claim) return null;

    claim.id = claim._id ? claim._id.toString() : claim.id;

    // Multi-user ownership & visibility enforcement
    const isPublic = claim.isPublic === true;
    const isPrivileged =
      currentUser &&
      (currentUser.role === "admin" || currentUser.role === "reviewer");
    const isOwner =
      currentUser &&
      claim.submittedBy &&
      claim.submittedBy.toString() === currentUser._id.toString();

    // Prevent IDOR: private claims are inaccessible to other users / guests
    if (!isPublic && !isPrivileged && !isOwner) {
      return null; // Controller returns 404 to hide resource existence
    }

    return claim;
  }

  /**
   * Update claim details with ownership enforcement.
   *
   * @param {string} id
   * @param {object} updates
   * @param {object} currentUser
   * @returns {Promise<object>}
   */
  async updateClaim(id, updates = {}, currentUser) {
    if (!id || typeof id !== "string") {
      const err = new Error("Invalid claim identifier.");
      err.statusCode = 400;
      throw err;
    }
    const cleanId = id.trim();
    if (!mongoose.isValidObjectId(cleanId)) {
      const err = new Error("Invalid claim identifier format.");
      err.statusCode = 400;
      throw err;
    }

    const claim = await Claim.findById(cleanId);
    if (!claim) {
      const err = new Error("Claim not found.");
      err.statusCode = 404;
      throw err;
    }

    const isPrivileged = currentUser && currentUser.role === "admin";
    const isOwner =
      currentUser &&
      claim.submittedBy &&
      claim.submittedBy.toString() === currentUser._id.toString();

    if (!isPrivileged && !isOwner) {
      const err = new Error("You are not authorized to modify this claim.");
      err.statusCode = 403;
      throw err;
    }

    const allowedFields = [
      "title",
      "claimText",
      "sourceUrl",
      "context",
      "categoryTags",
      "language",
    ];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        claim[key] = updates[key];
      }
    }

    // Only admins may alter the public publication status
    if (isPrivileged && updates.isPublic !== undefined) {
      claim.isPublic = Boolean(updates.isPublic);
    }

    await claim.save();
    return claim;
  }

  /**
   * Delete a claim with ownership enforcement.
   *
   * @param {string} id
   * @param {object} currentUser
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteClaim(id, currentUser) {
    if (!id || typeof id !== "string") {
      const err = new Error("Invalid claim identifier.");
      err.statusCode = 400;
      throw err;
    }
    const cleanId = id.trim();
    if (!mongoose.isValidObjectId(cleanId)) {
      const err = new Error("Invalid claim identifier format.");
      err.statusCode = 400;
      throw err;
    }

    const claim = await Claim.findById(cleanId);
    if (!claim) {
      const err = new Error("Claim not found.");
      err.statusCode = 404;
      throw err;
    }

    const isPrivileged = currentUser && currentUser.role === "admin";
    const isOwner =
      currentUser &&
      claim.submittedBy &&
      claim.submittedBy.toString() === currentUser._id.toString();

    if (!isPrivileged && !isOwner) {
      const err = new Error("You are not authorized to delete this claim.");
      err.statusCode = 403;
      throw err;
    }

    // Safely cleanup all attached Cloudinary image proof assets
    if (claim.imageProofs && claim.imageProofs.length > 0) {
      for (const proof of claim.imageProofs) {
        if (proof.publicId) {
          await deleteFromCloudinary(proof.publicId).catch(() => {});
        }
      }
    }

    // Delete associated verification report if present
    if (claim.verificationReport) {
      await VerificationReport.findByIdAndDelete(claim.verificationReport);
    }

    // Remove from all user saved claims
    await User.updateMany(
      { savedClaims: cleanId },
      { $pull: { savedClaims: cleanId } }
    );

    await Claim.findByIdAndDelete(cleanId);
    return { success: true, message: "Claim deleted successfully." };
  }

  /**
   * Derive aggregate verification and processing metrics with optional user scope.
   *
   * @param {object|null} currentUser
   * @param {string} [scope="platform"]
   * @returns {Promise<object>}
   */
  async getClaimStats(currentUser = null, scope = "platform") {
    const isUserScope = scope === "user" || scope === "mine";

    if (isUserScope) {
      if (!currentUser) {
        return {
          totalClaims: 0,
          completedVerifications: 0,
          underReview: 0,
          inVerification: 0,
          rejected: 0,
          byVerdict: {
            SUPPORTED: 0,
            CONTRADICTED: 0,
            PARTIALLY_SUPPORTED: 0,
            MISLEADING_CONTEXT: 0,
            INSUFFICIENT_EVIDENCE: 0,
          },
        };
      }

      const userFilter = { submittedBy: currentUser._id };
      const [totalClaims, completed, underReview, inVerification, rejected, verdictCounts] =
        await Promise.all([
          Claim.countDocuments(userFilter),
          Claim.countDocuments({ ...userFilter, status: CLAIM_STATUS.COMPLETED }),
          Claim.countDocuments({ ...userFilter, status: CLAIM_STATUS.UNDER_REVIEW }),
          Claim.countDocuments({ ...userFilter, status: CLAIM_STATUS.IN_VERIFICATION }),
          Claim.countDocuments({ ...userFilter, status: CLAIM_STATUS.REJECTED }),
          Claim.aggregate([
            { $match: { submittedBy: currentUser._id, verdictId: { $ne: null } } },
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

    // Platform-wide / Public metrics
    const publicFilter =
      currentUser && (currentUser.role === "admin" || currentUser.role === "reviewer")
        ? {}
        : { isPublic: true };

    const [totalClaims, completed, underReview, inVerification, rejected, verdictCounts] =
      await Promise.all([
        Claim.countDocuments(publicFilter),
        Claim.countDocuments({ ...publicFilter, status: CLAIM_STATUS.COMPLETED }),
        Claim.countDocuments({ ...publicFilter, status: CLAIM_STATUS.UNDER_REVIEW }),
        Claim.countDocuments({ ...publicFilter, status: CLAIM_STATUS.IN_VERIFICATION }),
        Claim.countDocuments({ ...publicFilter, status: CLAIM_STATUS.REJECTED }),
        Claim.aggregate([
          {
            $match: {
              ...(publicFilter.isPublic !== undefined ? { isPublic: true } : {}),
              verdictId: { $ne: null },
            },
          },
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

  /**
   * Delete an image proof attachment from a claim.
   * Enforces that only the claim owner or an admin/reviewer can remove evidence.
   *
   * @param {string} claimId
   * @param {string} publicId
   * @param {object} currentUser
   * @returns {Promise<object>}
   */
  async deleteEvidenceImage(claimId, publicId, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      const err = new Error("Invalid claim ID format.");
      err.statusCode = 400;
      throw err;
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      const err = new Error("Claim not found.");
      err.statusCode = 404;
      throw err;
    }

    const isPrivileged =
      currentUser && (currentUser.role === "admin" || currentUser.role === "reviewer");
    const isOwner =
      currentUser &&
      claim.submittedBy &&
      claim.submittedBy.toString() === currentUser._id.toString();

    if (!isPrivileged && !isOwner) {
      const err = new Error("You are not authorized to delete evidence from this claim.");
      err.statusCode = 403;
      throw err;
    }

    const targetProof = (claim.imageProofs || []).find((p) => p.publicId === publicId);
    if (!targetProof) {
      const err = new Error("Evidence image not found on this claim.");
      err.statusCode = 404;
      throw err;
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    // Remove from MongoDB claim document
    claim.imageProofs = claim.imageProofs.filter((p) => p.publicId !== publicId);
    await claim.save();

    return { success: true, message: "Evidence image deleted successfully.", claim };
  }
}

export const claimService = new ClaimService();
export default claimService;
