/**
 * ElectionVerify AI - React SPA Profile Service
 *
 * Integrated with the Shared-Backend User API (/api/users).
 * Handles profile inspection, name/email updates, preferences, and password changes,
 * with offline demo fallback when the backend server is unreachable.
 */

import { DEMO_USER } from "../data/mockData.js";
import { request, getStoredUser, setStoredUser } from "./api.js";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../utils/validators.js";

/**
 * Helper to build an active profile from stored user or defaults
 */
function resolveCurrentProfile() {
  const stored = getStoredUser();
  if (stored) {
    return {
      id: stored.id || DEMO_USER.id,
      name: stored.name || "User",
      email: stored.email || "",
      role: stored.role || "user",
      accountStatus: stored.accountStatus || "Active",
      joinedDate: stored.joinedDate || new Date().toISOString(),
      preferences: stored.preferences || {
        preferredLanguage: "English",
        theme: "System",
        notifications: {
          emailNotifications: true,
          resultNotifications: true,
          announcementNotifications: false,
        },
      },
    };
  }

  return {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
    accountStatus: DEMO_USER.accountStatus,
    joinedDate: DEMO_USER.joinedDate,
    preferences: {
      preferredLanguage: DEMO_USER.preferences.preferredLanguage,
      theme: DEMO_USER.preferences.theme,
      notifications: { ...DEMO_USER.preferences.notifications },
    },
  };
}

/**
 * Retrieve user profile from Shared-Backend API or local session fallback.
 *
 * @returns {Promise<object>}
 */
export async function getProfile() {
  const res = await request("/users/profile");

  if (res.success && res.data?.profile) {
    return {
      ...res.data.profile,
      id: res.data.profile.id || res.data.profile._id,
      isDemo: false,
    };
  }

  const profile = resolveCurrentProfile();
  return {
    ...profile,
    isDemo: true,
  };
}

/**
 * Update personal details (name, email) via Shared-Backend API.
 *
 * @param {object} updates
 * @param {string} updates.name
 * @param {string} updates.email
 * @returns {Promise<{ success: boolean, profile?: object, error?: string, message?: string, isDemo?: boolean }>}
 */
export async function updateProfile({ name, email } = {}) {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return { success: false, error: nameValidation.error };
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error };
  }

  const res = await request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
    }),
  });

  if (res.success && res.data?.profile) {
    const updated = {
      ...res.data.profile,
      id: res.data.profile.id || res.data.profile._id,
    };
    setStoredUser(updated);
    return {
      success: true,
      profile: updated,
      message: res.data.message || "Profile updated successfully.",
    };
  }

  if (res.isOffline) {
    const current = resolveCurrentProfile();
    const updated = {
      ...current,
      name: name.trim(),
      email: email.trim(),
    };
    setStoredUser(updated);
    return {
      success: true,
      isDemo: true,
      profile: updated,
      message: "Profile updated successfully.",
    };
  }

  return {
    success: false,
    error: res.error || "Failed to update profile.",
  };
}

/**
 * Update user preferences (language, theme, notifications).
 *
 * @param {object} preferences
 * @returns {Promise<{ success: boolean, message?: string, error?: string, isDemo?: boolean }>}
 */
export async function updatePreferences(preferences = {}) {
  const res = await request("/users/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });

  if (res.success) {
    return {
      success: true,
      message: "Preferences updated successfully.",
    };
  }

  if (res.isOffline) {
    const current = resolveCurrentProfile();
    const updated = {
      ...current,
      preferences: {
        ...current.preferences,
        ...preferences,
        notifications: {
          ...current.preferences.notifications,
          ...(preferences.notifications || {}),
        },
      },
    };
    setStoredUser(updated);
    return {
      success: true,
      isDemo: true,
      message: "Preferences updated successfully.",
    };
  }

  return {
    success: false,
    error: res.error || "Failed to update preferences.",
  };
}

/**
 * Update user account password via Shared-Backend API.
 * Passwords are never stored on the client.
 *
 * @param {object} credentials
 * @param {string} credentials.currentPassword
 * @param {string} credentials.newPassword
 * @param {string} [credentials.confirmPassword]
 * @returns {Promise<{ success: boolean, message?: string, error?: string, isDemo?: boolean }>}
 */
export async function updatePassword({
  currentPassword,
  newPassword,
  confirmPassword,
} = {}) {
  if (!currentPassword) {
    return { success: false, error: "Current password is required." };
  }

  const newPassVal = validatePassword(newPassword);
  if (!newPassVal.isValid) {
    return { success: false, error: newPassVal.error };
  }

  if (confirmPassword !== undefined) {
    const confirmVal = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmVal.isValid) {
      return { success: false, error: confirmVal.error };
    }
  }

  const res = await request("/users/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (res.success) {
    return {
      success: true,
      message: res.data?.message || "Password updated successfully.",
    };
  }

  if (res.isOffline) {
    return {
      success: true,
      isDemo: true,
      message: "Password validated and updated in demo session (never persisted).",
    };
  }

  return {
    success: false,
    error: res.error || "Password update failed.",
  };
}

export const simulatePasswordUpdate = updatePassword;
