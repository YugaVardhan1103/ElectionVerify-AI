/**
 * ElectionVerify AI - React SPA Authentication Service
 *
 * Integrated with the Shared-Backend REST API (/api/auth).
 * - Enforces standard JWT Bearer token sessions
 * - Stores token securely in client storage (never passwords)
 * - Automatically revokes expired/unauthorized sessions on 401
 */

import {
  request,
  setAuthToken,
  getAuthToken,
  getStoredUser,
  setStoredUser,
  clearAuthSession,
} from "./api.js";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordConfirmation,
} from "../utils/validators.js";

/**
 * In-memory active authentication state.
 */
let inMemoryAuthState = {
  isAuthenticated: false,
  currentUser: null,
};

/**
 * Authenticate user with email and password via Shared-Backend API.
 *
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ success: boolean, user?: object, token?: string, error?: string, isDemo?: boolean }>}
 */
export async function login({ email, password } = {}) {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { success: false, error: passwordValidation.error };
  }

  // Attempt real authentication against Shared-Backend
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (res.success && res.data) {
    setAuthToken(res.data.token);
    setStoredUser(res.data.user);
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: res.data.user,
    };
    return {
      success: true,
      user: res.data.user,
      token: res.data.token,
    };
  }

  if (res.isOffline) {
    return {
      success: false,
      error: "Authentication service is currently unreachable. Please check your network connection.",
    };
  }

  return {
    success: false,
    error: res.error || "Authentication failed.",
  };
}

/**
 * Real OAuth authentication with Google or Facebook.
 * Verifies token securely with backend, which validates directly with Google / Meta APIs.
 * Authenticated user is persisted in MongoDB and returned with real profile details.
 * No fake accounts or mock profiles.
 *
 * @param {object} payload
 * @param {string} [payload.provider="google"]
 * @param {string} [payload.idToken]
 * @param {string} [payload.accessToken]
 * @param {string} [payload.token]
 * @returns {Promise<{ success: boolean, user?: object, token?: string, error?: string }>}
 */
export async function socialLogin({ provider = "google", idToken, accessToken, token } = {}) {
  const normalizedProvider = provider.toLowerCase();
  const endpoint = normalizedProvider === "facebook" ? "/auth/facebook" : "/auth/google";

  const res = await request(endpoint, {
    method: "POST",
    body: JSON.stringify({
      provider: normalizedProvider,
      idToken,
      accessToken,
      token,
    }),
  });

  if (res.success && res.data) {
    setAuthToken(res.data.token);
    setStoredUser(res.data.user);
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: res.data.user,
    };
    return {
      success: true,
      user: res.data.user,
      token: res.data.token,
    };
  }

  return {
    success: false,
    error: res.error || `${provider} authentication failed. Please try again.`,
  };
}

/**
 * Register a new user account via Shared-Backend API.
 * Notice: Does NOT log the user in automatically, allowing redirection to login page.
 *
 * @param {object} registrationData
 * @param {string} registrationData.name
 * @param {string} registrationData.email
 * @param {string} registrationData.password
 * @param {string} registrationData.confirmPassword
 * @param {boolean} registrationData.agreedToTerms
 * @returns {Promise<{ success: boolean, user?: object, message?: string, error?: string, isDemo?: boolean }>}
 */
export async function signup({
  name,
  email,
  password,
  confirmPassword,
  agreedToTerms = false,
} = {}) {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return { success: false, error: nameValidation.error };
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { success: false, error: passwordValidation.error };
  }

  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmValidation.isValid) {
    return { success: false, error: confirmValidation.error };
  }

  if (!agreedToTerms) {
    return {
      success: false,
      error: "Please accept the Terms and Conditions to proceed.",
    };
  }

  // Attempt registration on Shared-Backend
  const res = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      password,
    }),
  });

  if (res.success && res.data) {
    // Note: Do not log the user in immediately so they proceed to the Login page
    return {
      success: true,
      user: res.data.user,
      message: "Account created successfully! Please log in.",
    };
  }

  if (res.isOffline) {
    return {
      success: false,
      error: "Registration service is currently unreachable. Please check your connection or try again later.",
    };
  }

  return {
    success: false,
    error: res.error || "Registration failed.",
  };
}

/**
 * Log out user: notifies backend and purges local session token and stored user.
 *
 * @returns {Promise<{ success: boolean }>}
 */
export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Ignore network error on logout
  } finally {
    clearAuthSession();
    inMemoryAuthState = {
      isAuthenticated: false,
      currentUser: null,
    };
  }
  return { success: true };
}

/**
 * Retrieve current user from backend session (/api/auth/me) or client storage.
 *
 * @returns {Promise<object|null>}
 */
export async function getMe() {
  const token = getAuthToken();
  if (!token) {
    inMemoryAuthState = { isAuthenticated: false, currentUser: null };
    return null;
  }

  const res = await request("/auth/me");
  if (res.success && res.data?.user) {
    setStoredUser(res.data.user);
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: res.data.user,
    };
    return res.data.user;
  }

  // If backend is offline, check if there is an active logged-in user in storage
  if (res.isOffline) {
    const storedUser = getStoredUser();
    if (storedUser) {
      inMemoryAuthState = {
        isAuthenticated: true,
        currentUser: storedUser,
      };
      return storedUser;
    }
  }

  // If token is invalid or no valid stored user exists, purge session
  clearAuthSession();
  inMemoryAuthState = { isAuthenticated: false, currentUser: null };
  return null;
}

/**
 * Synchronous snapshot of authentication state.
 */
export function getAuthState() {
  const storedUser = getStoredUser();
  return {
    isAuthenticated: Boolean(storedUser || inMemoryAuthState.currentUser),
    user: inMemoryAuthState.currentUser ? { ...inMemoryAuthState.currentUser } : storedUser,
  };
}
