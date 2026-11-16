/**
 * ElectionVerify AI - React SPA Claim Service
 *
 * Connects to the Shared-Backend REST API (/api/claims) with full query support,
 * robust error handling, and transparent offline/demo fallback.
 */

import {
  SAMPLE_CLAIMS,
  CLAIM_STATUS,
  getSampleClaimById,
} from "../data/mockData.js";
import { request } from "./api.js";
import { validateRequired, validateUrl } from "../utils/validators.js";

/**
 * In-memory storage for claims submitted while offline.
 */
let sessionSubmittedClaims = [];

function generateDemoClaimId() {
  const timestamp = Date.now();
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `claim-demo-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `claim-demo-${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Submit a new election claim via Shared-Backend API.
 *
 * @param {object} submissionData
 * @param {string} [submissionData.claim]
 * @param {string} [submissionData.claimText]
 * @param {string} [submissionData.sourceUrl=""]
 * @param {string} [submissionData.language="English"]
 * @param {string} [submissionData.context=""]
 * @param {Array<string>} [submissionData.categoryTags]
 * @returns {Promise<{ success: boolean, claim?: object, message?: string, error?: string, isDemo?: boolean }>}
 */
export async function submitClaim({
  claim,
  claimText,
  sourceUrl = "",
  language = "English",
  context = "",
  categoryTags = [],
} = {}) {
  const text = (claimText || claim || "").trim();

  const claimValidation = validateRequired(text, "Claim statement");
  if (!claimValidation.isValid) {
    return { success: false, error: claimValidation.error };
  }

  const urlValidation = validateUrl(sourceUrl, { required: false });
  if (!urlValidation.isValid) {
    return { success: false, error: urlValidation.error };
  }

  // Attempt backend submission
  const res = await request("/claims", {
    method: "POST",
    body: JSON.stringify({
      claimText: text,
      sourceUrl: sourceUrl.trim(),
      language: language.trim(),
      context: context.trim(),
      categoryTags: categoryTags.length > 0 ? categoryTags : ["General Election"],
    }),
  });

  if (res.success && res.data?.claim) {
    const created = res.data.claim;
    return {
      success: true,
      claim: { ...created, id: created._id || created.id },
      message: res.data.message || "Claim submitted successfully for verification.",
    };
  }

  // If backend is offline, store in local session memory
  if (res.isOffline) {
    const title = text.length > 60 ? `${text.slice(0, 57)}...` : text;
    const newClaim = {
      id: generateDemoClaimId(),
      title,
      claimText: text,
      sourceUrl: sourceUrl ? sourceUrl.trim() : "",
      language: language.trim(),
      context: context ? context.trim() : "",
      submittedDate: new Date().toISOString(),
      status: CLAIM_STATUS.UNDER_REVIEW,
      verdictId: null,
      categoryTags: categoryTags.length > 0 ? categoryTags : ["User Submission", "Demo Claim"],
      isSampleData: true,
      verificationReport: null,
    };

    sessionSubmittedClaims = [newClaim, ...sessionSubmittedClaims];

    return {
      success: true,
      isDemo: true,
      claim: newClaim,
      message: "Claim recorded in client session memory (backend offline).",
    };
  }

  return {
    success: false,
    error: res.error || "Failed to submit claim.",
  };
}

/**
 * Retrieve claims with search, filtering, and pagination from backend API.
 *
 * @param {object} [options]
 * @param {string} [options.searchTerm=""]
 * @param {string} [options.verdictId="ALL"]
 * @param {string} [options.status="ALL"]
 * @param {string} [options.language="ALL"]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<{ claims: Array<object>, pagination: object, isOffline: boolean }>}
 */
export async function getClaims(options = {}) {
  const {
    searchTerm = "",
    verdictId = "ALL",
    status = "ALL",
    language = "ALL",
    page = 1,
    limit = 10,
  } = options;

  const params = new URLSearchParams();
  if (page) params.set("page", page.toString());
  if (limit) params.set("limit", limit.toString());
  if (searchTerm && searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
  if (status && status !== "ALL") params.set("status", status);
  if (verdictId && verdictId !== "ALL") params.set("verdictId", verdictId);
  if (language && language !== "ALL") params.set("language", language);

  const res = await request(`/claims?${params.toString()}`);

  if (res.success && res.data?.claims) {
    const normalized = res.data.claims.map((c) => ({
      ...c,
      id: c.id || c._id,
    }));
    return {
      claims: normalized,
      pagination: res.data.pagination || {
        total: normalized.length,
        page,
        limit,
        totalPages: Math.ceil(normalized.length / limit) || 1,
      },
      isOffline: false,
    };
  }

  // Fallback: Client-side search & filtering across baseline + session
  const allClaims = [...sessionSubmittedClaims, ...SAMPLE_CLAIMS];
  const query = typeof searchTerm === "string" ? searchTerm.trim().toLowerCase() : "";
  const targetVerdict = typeof verdictId === "string" ? verdictId.trim().toUpperCase() : "ALL";
  const targetStatus = typeof status === "string" ? status.trim().toUpperCase() : "ALL";

  const filtered = allClaims.filter((claim) => {
    const matchesSearch =
      !query ||
      claim.title.toLowerCase().includes(query) ||
      claim.claimText.toLowerCase().includes(query);

    const matchesVerdict =
      targetVerdict === "ALL" || claim.verdictId === targetVerdict;

    const matchesStatus =
      targetStatus === "ALL" || claim.status === targetStatus;

    return matchesSearch && matchesVerdict && matchesStatus;
  });

  const sorted = filtered.sort(
    (a, b) => Date.parse(b.submittedDate) - Date.parse(a.submittedDate)
  );

  const start = (page - 1) * limit;
  const paged = sorted.slice(start, start + limit);

  return {
    claims: paged,
    pagination: {
      total: sorted.length,
      page,
      limit,
      totalPages: Math.ceil(sorted.length / limit) || 1,
    },
    isOffline: true,
  };
}

/**
 * Retrieve claim details by ID from backend or fallback cache.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getClaimById(id) {
  if (!id || typeof id !== "string") return null;
  const cleanId = id.trim();

  const res = await request(`/claims/${cleanId}`);
  if (res.success && res.data?.claim) {
    const c = res.data.claim;
    return { ...c, id: c.id || c._id };
  }

  // Check in-memory session submissions
  const sessionMatch = sessionSubmittedClaims.find(
    (c) => c.id === cleanId || c._id === cleanId
  );
  if (sessionMatch) return sessionMatch;

  // Fall back to baseline fixtures
  return getSampleClaimById(cleanId);
}

/**
 * Retrieve verification report for a given claim.
 *
 * @param {string} claimId
 * @returns {Promise<{ success: boolean, claim?: object, report?: object, isUnderReview?: boolean, isOffline?: boolean, error?: string }>}
 */
export async function getVerificationReport(claimId) {
  const claim = await getClaimById(claimId);

  if (!claim) {
    return {
      success: false,
      isDemo: true,
      error: "Claim record not found.",
      report: null,
      claim: null,
    };
  }

  const isUnderReview =
    claim.status === CLAIM_STATUS.UNDER_REVIEW ||
    claim.status === CLAIM_STATUS.IN_VERIFICATION;

  return {
    success: true,
    claim,
    report: claim.verificationReport || null,
    isUnderReview,
  };
}

/**
 * Fetch aggregate claim metrics from backend API.
 *
 * @returns {Promise<object>}
 */
export async function getClaimStats() {
  const res = await request("/claims/stats");
  if (res.success && res.data?.stats) {
    return {
      ...res.data.stats,
      isOffline: false,
    };
  }

  // Fallback metrics calculation
  const allClaims = [...sessionSubmittedClaims, ...SAMPLE_CLAIMS];
  return {
    totalClaims: allClaims.length,
    completedVerifications: allClaims.filter(
      (c) => c.status === CLAIM_STATUS.COMPLETED
    ).length,
    underReview: allClaims.filter((c) => c.status === CLAIM_STATUS.UNDER_REVIEW).length,
    inVerification: allClaims.filter(
      (c) => c.status === CLAIM_STATUS.IN_VERIFICATION
    ).length,
    rejected: allClaims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length,
    byVerdict: {
      SUPPORTED: allClaims.filter((c) => c.verdictId === "SUPPORTED").length,
      CONTRADICTED: allClaims.filter((c) => c.verdictId === "CONTRADICTED").length,
      PARTIALLY_SUPPORTED: allClaims.filter(
        (c) => c.verdictId === "PARTIALLY_SUPPORTED"
      ).length,
      MISLEADING_CONTEXT: allClaims.filter(
        (c) => c.verdictId === "MISLEADING_CONTEXT"
      ).length,
      INSUFFICIENT_EVIDENCE: allClaims.filter(
        (c) => c.verdictId === "INSUFFICIENT_EVIDENCE"
      ).length,
    },
    isOffline: true,
  };
}

/**
 * Resets in-memory session claims for testing.
 */
export function resetSessionClaims() {
  sessionSubmittedClaims = [];
}
