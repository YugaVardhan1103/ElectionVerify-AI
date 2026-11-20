/**
 * ElectionVerify AI - React Client REST API Client
 *
 * Provides a standardized HTTP transport layer connecting to the Shared-Backend.
 * Features:
 * - Independent configuration via VITE_API_URL
 * - Bearer JWT token management (stored under 'electionverify_token')
 * - Automatic token revocation on 401 Unauthorized / Token Expired
 * - Graceful fallback signaling (isOffline) when backend is unavailable
 */

function resolveApiBaseUrl(url) {
  const raw = (url || "").trim() || "http://localhost:5000/api";
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL);

/**
 * Builds the fully qualified request URL, safely preventing duplicate /api segments.
 */
export function buildApiUrl(endpoint) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (base.endsWith("/api") && path.startsWith("/api/")) {
    path = path.slice(4);
  }
  return `${base}${path}`;
}

const TOKEN_KEY = "electionverify_token";
const USER_KEY = "electionverify_user";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(USER_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuthSession() {
  setAuthToken(null);
  setStoredUser(null);
}

/**
 * Standard fetch wrapper with JWT attachment, error parsing, and offline detection.
 *
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g. "/claims")
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<{ success: boolean, data?: any, error?: string, isOffline?: boolean, status?: number }>}
 */
export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const targetUrl = buildApiUrl(endpoint);

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Revoke invalid / expired token on 401
      if (res.status === 401) {
        clearAuthSession();
      }
      return {
        success: false,
        status: res.status,
        error: json.error || `Request failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      status: res.status,
      data: json.data !== undefined ? json.data : json,
    };
  } catch (err) {
    // Backend server offline, CORS blocked, or network unreachable
    console.warn(`[API Client] Backend unreachable at ${targetUrl}:`, err);
    const isMixedContent =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      (API_BASE_URL.startsWith("http://localhost") ||
        API_BASE_URL.startsWith("http://127.0.0.1"));

    const errorMessage = isMixedContent
      ? "Cannot connect to local backend (http://localhost:5000) from a secure HTTPS deployment. Please configure VITE_API_URL to point to your live backend API."
      : "Backend service is currently unreachable. Please ensure the backend server is running.";

    return {
      success: false,
      isOffline: true,
      error: errorMessage,
    };
  }
}
