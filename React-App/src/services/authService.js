/**
 * ElectionVerify AI - React SPA Authentication Service
 *
 * Integrated with the Shared-Backend REST API (/api/auth).
 * - Enforces standard JWT Bearer token sessions
 * - Stores token securely in client storage (never passwords)
 * - Automatically revokes expired/unauthorized sessions on 401
 * - Provides graceful demo mode fallback when backend is unreachable
 */

import { DEMO_USER } from "../data/mockData.js";
import { request, setAuthToken, getAuthToken } from "./api.js";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordConfirmation,
} from "../utils/validators.js";

/**
 * In-memory fallback authentication state for offline/demo operation.
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

  // If backend server is unreachable, allow seamless demo login
  if (res.isOffline) {
    const demoUser = {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: email.trim(),
      role: DEMO_USER.role,
      isDemoUser: true,
    };
    setAuthToken("demo-token-session");
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: demoUser,
    };
    return {
      success: true,
      user: demoUser,
      isDemo: true,
      message: "Connected in client demo mode (backend server offline).",
    };
  }

  return {
    success: false,
    error: res.error || "Authentication failed.",
  };
}

/**
 * Register a new user account via Shared-Backend API.
 *
 * @param {object} registrationData
 * @param {string} registrationData.name
 * @param {string} registrationData.email
 * @param {string} registrationData.password
 * @param {string} registrationData.confirmPassword
 * @param {boolean} registrationData.agreedToTerms
 * @returns {Promise<{ success: boolean, user?: object, token?: string, error?: string, isDemo?: boolean }>}
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
    setAuthToken(res.data.token);
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

  // Fallback to client demo registration if backend is offline
  if (res.isOffline) {
    const demoUser = {
      id: `usr_demo_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: "user",
      isDemoUser: true,
    };
    setAuthToken("demo-token-session");
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: demoUser,
    };
    return {
      success: true,
      user: demoUser,
      isDemo: true,
      message: "Account created in client demo mode (backend offline).",
    };
  }

  return {
    success: false,
    error: res.error || "Registration failed.",
  };
}

/**
 * Log out user: notifies backend and purges local session token.
 *
 * @returns {Promise<{ success: boolean }>}
 */
export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Ignore network error on logout
  } finally {
    setAuthToken(null);
    inMemoryAuthState = {
      isAuthenticated: false,
      currentUser: null,
    };
  }
  return { success: true };
}

/**
 * Retrieve current user from backend session (/api/auth/me).
 *
 * @returns {Promise<object|null>}
 */
export async function getMe() {
  const token = getAuthToken();
  if (!token) {
    inMemoryAuthState = { isAuthenticated: false, currentUser: null };
    return null;
  }

  if (token === "demo-token-session") {
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: inMemoryAuthState.currentUser || DEMO_USER,
    };
    return inMemoryAuthState.currentUser;
  }

  const res = await request("/auth/me");
  if (res.success && res.data?.user) {
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: res.data.user,
    };
    return res.data.user;
  }

  // If backend is offline but a session token exists, use fallback user
  if (res.isOffline && token) {
    return inMemoryAuthState.currentUser || DEMO_USER;
  }

  // Invalid or expired token
  setAuthToken(null);
  inMemoryAuthState = { isAuthenticated: false, currentUser: null };
  return null;
}

/**
 * Synchronous snapshot of authentication state.
 */
export function getDemoAuthState() {
  return {
    isAuthenticated: inMemoryAuthState.isAuthenticated,
    isDemo: !getAuthToken() || getAuthToken() === "demo-token-session",
    user: inMemoryAuthState.currentUser ? { ...inMemoryAuthState.currentUser } : null,
  };
}

// Preserve backwards-compatible legacy exports
export const demoLogin = login;
export const demoSignup = signup;
export const demoLogout = logout;
export function resetDemoAuthState() {
  setAuthToken(null);
  inMemoryAuthState = { isAuthenticated: false, currentUser: null };
}
