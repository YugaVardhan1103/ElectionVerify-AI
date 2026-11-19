import crypto from "crypto";
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
   * Securely verify a Google token (ID token or access token) directly with Google servers.
   *
   * @param {object} param
   * @param {string} [param.idToken]
   * @param {string} [param.accessToken]
   * @param {string} [param.token]
   * @returns {Promise<{ email: string, name: string, picture: string|null, id: string }>}
   */
  async verifyGoogleToken({ idToken, accessToken, token }) {
    const rawToken = idToken || token || accessToken;
    if (!rawToken) {
      const error = new Error("Google authentication requires an idToken or accessToken.");
      error.statusCode = 400;
      throw error;
    }

    let profile = null;

    // 1. Try Google tokeninfo (standard for JWT ID tokens from Google Identity Services)
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawToken)}`);
      if (res.ok) {
        const info = await res.json();
        if (info.email) {
          profile = {
            email: info.email.toLowerCase(),
            name: info.name || info.email.split("@")[0],
            picture: info.picture || null,
            id: info.sub,
            verified: info.email_verified === "true" || info.email_verified === true,
          };
        }
      }
    } catch {
      // Fall through to userinfo endpoint
    }

    // 2. Try Google userinfo (standard for OAuth2 Bearer access tokens)
    if (!profile) {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${rawToken}` },
        });
        if (res.ok) {
          const info = await res.json();
          if (info.email) {
            profile = {
              email: info.email.toLowerCase(),
              name: info.name || info.email.split("@")[0],
              picture: info.picture || null,
              id: info.sub,
              verified: info.email_verified === true,
            };
          }
        }
      } catch {
        // Handled below
      }
    }

    if (!profile || !profile.email) {
      const error = new Error("Failed to verify Google credentials with Google OAuth service. Token is invalid or expired.");
      error.statusCode = 401;
      throw error;
    }

    if (!profile.verified) {
      const error = new Error("Google account email address is not verified.");
      error.statusCode = 403;
      throw error;
    }

    return profile;
  }

  /**
   * Securely verify a Facebook access token directly with Facebook Graph API.
   *
   * @param {string} accessToken
   * @returns {Promise<{ email: string, name: string, picture: string|null, id: string }>}
   */
  async verifyFacebookToken(accessToken) {
    if (!accessToken) {
      const error = new Error("Facebook authentication requires an accessToken.");
      error.statusCode = 400;
      throw error;
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
    );

    const data = await res.json();
    if (!res.ok || data.error) {
      const error = new Error(data.error?.message || "Failed to verify Facebook access token with Meta Graph API.");
      error.statusCode = 401;
      throw error;
    }

    const email = (data.email || `${data.id}@facebook.user`).toLowerCase();
    const picture = data.picture?.data?.url || null;

    return {
      email,
      name: data.name || "Facebook User",
      picture,
      id: data.id,
    };
  }

  /**
   * Authenticate real Google or Facebook user:
   * 1. Verifies token with the OAuth provider's official API
   * 2. Finds or creates the user in MongoDB with their actual details (name, email, profile picture)
   * 3. Issues standard signed JWT session token
   *
   * @param {object} authPayload
   * @param {string} authPayload.provider - "google" | "facebook"
   * @param {string} [authPayload.idToken]
   * @param {string} [authPayload.accessToken]
   * @param {string} [authPayload.token]
   * @returns {Promise<{ user: object, token: string }>}
   */
  async authenticateOAuthUser({ provider = "google", idToken, accessToken, token } = {}) {
    const normalizedProvider = provider.toLowerCase();
    let verifiedProfile = null;

    if (normalizedProvider === "google") {
      verifiedProfile = await this.verifyGoogleToken({ idToken, accessToken, token });
    } else if (normalizedProvider === "facebook") {
      verifiedProfile = await this.verifyFacebookToken(accessToken || token);
    } else {
      const error = new Error(`Unsupported OAuth provider: '${provider}'. Must be 'google' or 'facebook'.`);
      error.statusCode = 400;
      throw error;
    }

    // Check MongoDB for existing user by verified email
    let user = await User.findOne({ email: verifiedProfile.email });

    if (!user) {
      // Create new MongoDB user account with random secure password and real verified OAuth details
      const randomPassword = crypto.randomBytes(32).toString("hex") + "!Aa1";
      user = await User.create({
        name: verifiedProfile.name,
        email: verifiedProfile.email,
        password: randomPassword,
        avatarUrl: verifiedProfile.picture,
        authProvider: normalizedProvider,
        providerId: verifiedProfile.id,
        role: "user",
        accountStatus: "Active",
      });
    } else {
      // Update existing account with latest avatar and link auth provider
      let isModified = false;
      if (verifiedProfile.picture && user.avatarUrl !== verifiedProfile.picture) {
        user.avatarUrl = verifiedProfile.picture;
        isModified = true;
      }
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = normalizedProvider;
        user.providerId = verifiedProfile.id;
        isModified = true;
      }
      if (isModified) {
        await user.save();
      }
    }

    if (user.accountStatus === "Suspended") {
      const error = new Error("Account has been suspended.");
      error.statusCode = 403;
      throw error;
    }

    const jwtToken = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token: jwtToken,
    };
  }

  // Alias for backward compatibility
  async socialLogin(params) {
    return this.authenticateOAuthUser(params);
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
