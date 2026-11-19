import mongoose from "mongoose";
import { authService } from "../services/authService.js";
import { User } from "../models/User.js";
import { Claim } from "../models/Claim.js";

/**
 * Get Profile of Authenticated User
 * GET /api/users/profile
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Personal Information
 * PUT /api/users/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const updated = await authService.updateProfile(req.user._id, { name, email });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { profile: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update User Preferences
 * PUT /api/users/preferences
 */
export async function updatePreferences(req, res, next) {
  try {
    const { preferredLanguage, theme, notifications } = req.body;
    const updated = await authService.updatePreferences(req.user._id, {
      preferredLanguage,
      theme,
      notifications,
    });
    res.status(200).json({
      success: true,
      message: "Preferences updated successfully.",
      data: { preferences: updated.preferences },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update User Password
 * PUT /api/users/password
 */
export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Both currentPassword and newPassword are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long.",
      });
    }

    const result = await authService.updatePassword(req.user._id, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Users (Admin only)
 * GET /api/users
 */
export async function listUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

/**
 * Update User Role (Admin only)
 * PATCH /api/users/:id/role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "reviewer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role specified. Must be one of: ['user', 'reviewer', 'admin'].",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve saved / bookmarked claims for authenticated user
 * GET /api/users/saved-claims
 */
export async function getSavedClaims(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "savedClaims",
        populate: { path: "verificationReport" },
      })
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Filter accessible claims: public or owned by user or privileged reviewer/admin
    const accessibleClaims = (user.savedClaims || []).filter((claim) => {
      if (!claim) return false;
      if (claim.isPublic) return true;
      if (req.user.role === "admin" || req.user.role === "reviewer") return true;
      return (
        claim.submittedBy &&
        claim.submittedBy.toString() === req.user._id.toString()
      );
    });

    res.status(200).json({
      success: true,
      data: { savedClaims: accessibleClaims },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Save / Bookmark a claim for authenticated user
 * POST /api/users/saved-claims/:claimId
 */
export async function saveClaim(req, res, next) {
  try {
    const { claimId } = req.params;
    if (!mongoose.isValidObjectId(claimId)) {
      return res.status(400).json({ success: false, error: "Invalid claim ID format." });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, error: "Claim not found." });
    }

    const isPublic = claim.isPublic === true;
    const isOwner =
      claim.submittedBy &&
      claim.submittedBy.toString() === req.user._id.toString();
    const isPrivileged =
      req.user.role === "admin" || req.user.role === "reviewer";

    // Disallow saving another user's private claim
    if (!isPublic && !isOwner && !isPrivileged) {
      return res.status(404).json({ success: false, error: "Claim not found." });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedClaims: claimId },
    });

    res.status(200).json({
      success: true,
      message: "Claim saved successfully.",
      data: { claimId },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove a saved / bookmarked claim for authenticated user
 * DELETE /api/users/saved-claims/:claimId
 */
export async function removeSavedClaim(req, res, next) {
  try {
    const { claimId } = req.params;
    if (!mongoose.isValidObjectId(claimId)) {
      return res.status(400).json({ success: false, error: "Invalid claim ID format." });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedClaims: claimId },
    });

    res.status(200).json({
      success: true,
      message: "Claim removed from saved items.",
      data: { claimId },
    });
  } catch (error) {
    next(error);
  }
}
