import { ClaimItem, ClaimStats, UserProfile } from "@/types";
import {
  BASELINE_SAMPLE_CLAIMS,
  BASELINE_STATS,
  DEMO_USER,
} from "./mockData";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// In-memory session claims cache for when backend server is offline
let sessionClaims: ClaimItem[] = [];

const TOKEN_KEY = "electionverify_token";
const USER_KEY = "electionverify_user";
const REGISTERED_USERS_KEY = "electionverify_registered_users";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(USER_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null) {
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

function getRegisteredUsers(): Array<{ name: string; email: string }> {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(REGISTERED_USERS_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: { name: string; email: string }) {
  if (typeof window === "undefined") return;
  const list = getRegisteredUsers().filter(
    (u) => u.email.toLowerCase() !== user.email.toLowerCase()
  );
  list.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
}

function formatNameFromEmail(email: string): string {
  const prefix = email.split("@")[0] || "User";
  return (
    prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(" ") || "User"
  );
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; isOffline?: boolean }> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
      }
      return {
        success: false,
        error: json.error || `Request failed with status ${res.status}`,
      };
    }
    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
    };
  } catch (err: unknown) {
    // Network error (backend server offline / unreachable)
    console.warn(`[API Client] Backend unreachable at ${API_BASE_URL}${endpoint}:`, err);
    return {
      success: false,
      isOffline: true,
      error: "Backend API is currently offline. Operating in client demo mode.",
    };
  }
}

/* ================= AUTH API ================= */
export const authApi = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await request<{ user: UserProfile; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      // Do not set token so user logs in on login page
      return { success: true, user: res.data.user };
    }

    if (res.isOffline) {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        role: "user",
        accountStatus: "Active",
        joinedDate: new Date().toISOString(),
        preferences: DEMO_USER.preferences,
      };
      saveRegisteredUser({ name: data.name.trim(), email: data.email.trim() });
      // Do not set auth token here so user proceeds to login page
      return { success: true, user: newUser, isDemo: true };
    }

    return { success: false, error: res.error };
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ user: UserProfile; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      setAuthToken(res.data.token);
      setStoredUser(res.data.user);
      return { success: true, user: res.data.user };
    }

    if (res.isOffline) {
      const cleanEmail = data.email.trim().toLowerCase();
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
        : formatNameFromEmail(data.email.trim());

      const userObj: UserProfile = {
        id: isDemoAccount ? DEMO_USER.id : `usr_${Date.now()}`,
        name: userName,
        email: data.email.trim(),
        role: isDemoAccount ? DEMO_USER.role : "user",
        accountStatus: "Active",
        joinedDate: new Date().toISOString(),
        preferences: DEMO_USER.preferences,
      };

      setAuthToken("demo-token-session");
      setStoredUser(userObj);
      return {
        success: true,
        user: userObj,
        isDemo: true,
      };
    }

    return { success: false, error: res.error };
  },

  async getMe() {
    const token = getAuthToken();
    if (!token) return null;

    const res = await request<{ user: UserProfile }>("/auth/me");
    if (res.success && res.data) {
      setStoredUser(res.data.user);
      return res.data.user;
    }
    if (res.isOffline) {
      const stored = getStoredUser();
      if (stored) return stored;
    }

    clearAuthSession();
    return null;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuthSession();
    }
  },
};

/* ================= USER / PROFILE API ================= */
export const userApi = {
  async getProfile(): Promise<UserProfile> {
    const res = await request<{ profile: UserProfile }>("/users/profile");
    if (res.success && res.data) {
      setStoredUser(res.data.profile);
      return res.data.profile;
    }
    const stored = getStoredUser();
    if (stored) return stored;
    return DEMO_USER;
  },

  async updateProfile(data: { name: string; email: string }) {
    const res = await request<{ profile: UserProfile }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.success && res.data) {
      setStoredUser(res.data.profile);
      return { success: true, profile: res.data.profile };
    }
    const current = getStoredUser() || DEMO_USER;
    const updated = { ...current, name: data.name, email: data.email };
    setStoredUser(updated);
    return {
      success: true,
      profile: updated,
      isDemo: true,
    };
  },

  async updatePreferences(data: Partial<UserProfile["preferences"]>) {
    const res = await request("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  },

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const res = await request<{ message: string }>("/users/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.isOffline) {
      return {
        success: true,
        message: "Password updated in demo mode (never saved).",
      };
    }
    return {
      success: res.success,
      message: res.data?.message,
      error: res.error,
    };
  },
};

/* ================= CLAIMS API ================= */
export const claimsApi = {
  async getClaims(query: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: string;
    verdictId?: string;
    language?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (query.page) params.set("page", query.page.toString());
    if (query.limit) params.set("limit", query.limit.toString());
    if (query.searchTerm) params.set("searchTerm", query.searchTerm);
    if (query.status && query.status !== "ALL") params.set("status", query.status);
    if (query.verdictId && query.verdictId !== "ALL") params.set("verdictId", query.verdictId);
    if (query.language && query.language !== "ALL") params.set("language", query.language);

    const res = await request<{
      claims: ClaimItem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
      isOffline?: boolean;
    }>(`/claims?${params.toString()}`);

    if (res.success && res.data) {
      return {
        ...res.data,
        isOffline: false,
      };
    }

    // Fallback: Client-side filtering across baseline + session claims
    const all = [...sessionClaims, ...BASELINE_SAMPLE_CLAIMS];
    const filtered = all.filter((c) => {
      const matchSearch =
        !query.searchTerm ||
        c.title.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
        c.claimText.toLowerCase().includes(query.searchTerm.toLowerCase());
      const matchStatus =
        !query.status || query.status === "ALL" || c.status === query.status;
      const matchVerdict =
        !query.verdictId || query.verdictId === "ALL" || c.verdictId === query.verdictId;
      return matchSearch && matchStatus && matchVerdict;
    });

    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      claims: paged,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
      isOffline: true,
    };
  },

  async getClaimStats(): Promise<ClaimStats> {
    const res = await request<{ stats: ClaimStats }>("/claims/stats");
    if (res.success && res.data) {
      return res.data.stats;
    }
    return BASELINE_STATS;
  },

  async getClaimById(id: string): Promise<ClaimItem | null> {
    const res = await request<{ claim: ClaimItem }>(`/claims/${id}`);
    if (res.success && res.data) {
      return res.data.claim;
    }

    // Search session and baseline
    const found =
      sessionClaims.find((c) => c.id === id || c._id === id) ||
      BASELINE_SAMPLE_CLAIMS.find((c) => c.id === id);

    return found || null;
  },

  async submitClaim(data: {
    claimText: string;
    sourceUrl?: string;
    language?: string;
    context?: string;
    categoryTags?: string[];
  }): Promise<{
    success: boolean;
    claim?: ClaimItem;
    message?: string;
    error?: string;
    isDemo?: boolean;
  }> {
    const res = await request<{ claim: ClaimItem }>("/claims", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      return { success: true, claim: res.data.claim };
    }

    if (res.isOffline) {
      // Offline mode: store in sessionClaims
      const newClaim: ClaimItem = {
        id: `claim-demo-${Date.now()}`,
        title:
          data.claimText.length > 60
            ? `${data.claimText.slice(0, 57)}...`
            : data.claimText,
        claimText: data.claimText,
        sourceUrl: data.sourceUrl || "",
        language: data.language || "English",
        context: data.context || "",
        submittedDate: new Date().toISOString(),
        status: "UNDER_REVIEW",
        verdictId: null,
        categoryTags: data.categoryTags || ["User Submission", "Demo Claim"],
        isSampleData: true,
        verificationReport: null,
      };

      sessionClaims = [newClaim, ...sessionClaims];
      return {
        success: true,
        claim: newClaim,
        isDemo: true,
        message: "Claim recorded in client session memory (backend offline).",
      };
    }

    return {
      success: false,
      error: res.error || "Failed to submit claim.",
    };
  },
};
