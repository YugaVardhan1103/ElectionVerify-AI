import { authService } from "../services/authService.js";
import { User } from "../models/User.js";

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
