import { User } from "../models/User.js";

/**
 * ElectionVerify AI - Authentication & Profile Service
 */
export class AuthService {
  /**
   * Register a new user account.
   *
   * @param {object} registrationData
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register({ name, email, password, role }) {
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      const error = new Error("An account with this email address already exists.");
      error.statusCode = 409;
      throw error;
    }

    // Role defaults to 'user'. Reviewer/Admin cannot self-assign unless explicitly permitted
    const assignedRole = role === "reviewer" || role === "admin" ? "user" : "user";

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
    });

    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Authenticate user with email and password.
   *
   * @param {object} credentials
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();

    // Must explicitly select '+password' because schema defines select: false
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus === "Suspended") {
      const error = new Error("Account has been suspended.");
      error.statusCode = 403;
      throw error;
    }

    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Retrieve user profile by ID.
   *
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }

  /**
   * Update personal profile details (Name, Email).
   *
   * @param {string} userId
   * @param {object} updates
   * @returns {Promise<object>}
   */
  async updateProfile(userId, { name, email }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (name && typeof name === "string") {
      user.name = name.trim();
    }

    if (email && typeof email === "string") {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const emailInUse = await User.findOne({ email: cleanEmail });
        if (emailInUse) {
          const error = new Error("This email address is already in use.");
          error.statusCode = 409;
          throw error;
        }
        user.email = cleanEmail;
      }
    }

    await user.save();
    return user.toJSON();
  }

  /**
   * Update user preferences (Language, Theme, Notifications).
   *
   * @param {string} userId
   * @param {object} preferencesUpdate
   * @returns {Promise<object>}
   */
  async updatePreferences(userId, { preferredLanguage, theme, notifications }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (preferredLanguage !== undefined) {
      user.preferences.preferredLanguage = preferredLanguage;
    }

    if (theme !== undefined) {
      const validThemes = ["Light", "Dark", "System"];
      if (!validThemes.includes(theme)) {
        const error = new Error("Theme must be 'Light', 'Dark', or 'System'.");
        error.statusCode = 400;
        throw error;
      }
      user.preferences.theme = theme;
    }

    if (notifications && typeof notifications === "object") {
      user.preferences.notifications = {
        ...user.preferences.notifications.toObject(),
        ...notifications,
      };
    }

    await user.save();
    return user.toJSON();
  }

  /**
   * Update user password securely.
   *
   * @param {string} userId
   * @param {object} passwordData
   */
  async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password does not match.");
      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: "Password updated successfully." };
  }
}

export const authService = new AuthService();
export default authService;
