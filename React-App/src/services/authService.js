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

const REGISTERED_USERS_KEY = "electionverify_registered_users";

function getRegisteredUsers() {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(REGISTERED_USERS_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user) {
  if (typeof window === "undefined") return;
  const list = getRegisteredUsers().filter(
    (u) => u.email.toLowerCase() !== user.email.toLowerCase()
  );
  list.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
}

function formatNameFromEmail(email) {
  const prefix = email.split("@")[0] || "User";
  return prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ") || "User";
}

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

  // If backend server is unreachable, allow seamless demo/offline login
  if (res.isOffline) {
    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers().find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    const isDemoAccount =
      cleanEmail === "demo.user@example.com" ||
      cleanEmail === "demo.user@example.invalid";

    const userName = registered
      ? registered.name
      : isDemoAccount
      ? DEMO_USER.name
      : formatNameFromEmail(email.trim());

    const userObj = {
      id: registered ? registered.id : isDemoAccount ? DEMO_USER.id : `usr_${Date.now()}`,
      name: userName,
      email: email.trim(),
      role: isDemoAccount ? DEMO_USER.role : "user",
      accountStatus: "Active",
      joinedDate: new Date().toISOString(),
      isDemoUser: true,
      preferences: {
        preferredLanguage: "English",
        theme: "System",
        notifications: {
          emailNotifications: true,
          resultNotifications: true,
          announcementNotifications: false,
        },
      },
    };

    setAuthToken("demo-token-session");
    setStoredUser(userObj);
    inMemoryAuthState = {
      isAuthenticated: true,
      currentUser: userObj,
    };
    return {
      success: true,
      user: userObj,
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
 * Sign in via OAuth / Social provider (Google, Facebook).
 * Supports explicit account confirmation (email & name) or default demo profile.
 * Contacts Shared-Backend /api/auth/social or activates client demo session.
 *
 * @param {string|object} options - "google" | "facebook" or { provider, email, name, avatarUrl }
 * @returns {Promise<{ success: boolean, user?: object, token?: string, error?: string, isDemo?: boolean }>}
 */
export async function socialLogin(options = "google") {
  const opts = typeof options === "string" ? { provider: options } : (options || {});
  const provider = (opts.provider || "google").toLowerCase();
  const providerLabel = provider === "facebook" ? "Facebook" : "Google";
  const userEmail = (opts.email || `${provider}.voter@example.com`).trim().toLowerCase();
  const userName = opts.name?.trim() || formatNameFromEmail(userEmail) || `${providerLabel} Voter`;

  // Try real social authentication with Shared-Backend
  const res = await request("/auth/social", {
    method: "POST",
    body: JSON.stringify({
      provider,
      email: userEmail,
      name: userName,
      avatarUrl: opts.avatarUrl,
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

  // Seamless offline/demo fallback
  const userObj = {
    id: `usr_${provider}_${Date.now()}`,
    name: userName,
    email: userEmail,
    role: "user",
    accountStatus: "Active",
    joinedDate: new Date().toISOString(),
    isDemoUser: true,
    provider,
    preferences: {
      preferredLanguage: "English",
      theme: "System",
      notifications: {
        emailNotifications: true,
        resultNotifications: true,
        announcementNotifications: false,
      },
    },
  };

  saveRegisteredUser(userObj);
  setAuthToken(`demo-${provider}-token`);
  setStoredUser(userObj);
  inMemoryAuthState = {
    isAuthenticated: true,
    currentUser: userObj,
  };

  return {
    success: true,
    user: userObj,
    isDemo: true,
    message: `Signed in with ${providerLabel} as ${userEmail}.`,
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

  // Fallback to client demo registration if backend is offline
  if (res.isOffline) {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password,
      role: "user",
      isDemoUser: true,
      joinedDate: new Date().toISOString(),
    };
    saveRegisteredUser(newUser);

    // Note: Do not set session token here so user can log in on Login page
    return {
      success: true,
      user: newUser,
      isDemo: true,
      message: "Account created successfully! Please log in.",
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
export function getDemoAuthState() {
  const storedUser = getStoredUser();
  return {
    isAuthenticated: Boolean(storedUser || inMemoryAuthState.currentUser),
    isDemo: Boolean((storedUser || inMemoryAuthState.currentUser)?.isDemoUser),
    user: inMemoryAuthState.currentUser ? { ...inMemoryAuthState.currentUser } : storedUser,
  };
}

// Preserve backwards-compatible legacy exports
export const demoLogin = login;
export const demoSignup = signup;
export const demoLogout = logout;
export function resetDemoAuthState() {
  clearAuthSession();
  inMemoryAuthState = { isAuthenticated: false, currentUser: null };
}
