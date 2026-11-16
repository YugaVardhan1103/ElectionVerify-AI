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

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "electionverify_token";

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

/**
 * Standard fetch wrapper with JWT attachment, error parsing, and offline detection.
 *
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g. "/claims")
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<{ success: boolean, data?: any, error?: string, isOffline?: boolean, status?: number }>}
 */
export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Revoke invalid / expired token on 401
      if (res.status === 401) {
        setAuthToken(null);
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
    // Backend server offline or network unreachable
    console.warn(`[API Client] Backend unreachable at ${API_BASE_URL}${endpoint}:`, err);
    return {
      success: false,
      isOffline: true,
      error: "Backend API is currently offline. Operating in client demo mode.",
    };
  }
}
