/**
 * ElectionVerify AI - Shared Backend Canonical Constants
 *
 * Enforces official platform standards across models, services, and controllers:
 * - 5 Canonical Verification Verdicts (matching frontend definitions exactly)
 * - 4 Claim Processing Lifecycle Statuses
 * - User Authorization Roles
 */

export const VERDICTS = Object.freeze({
  SUPPORTED: {
    id: "SUPPORTED",
    label: "Supported by Evidence",
    shortLabel: "Supported",
    description:
      "Reliable evidence directly supports the core claims made in the statement.",
  },
  CONTRADICTED: {
    id: "CONTRADICTED",
    label: "Contradicted by Evidence",
    shortLabel: "Contradicted",
    description:
      "Reliable evidence directly contradicts the core claims made in the statement.",
  },
  PARTIALLY_SUPPORTED: {
    id: "PARTIALLY_SUPPORTED",
    label: "Partially Supported",
    shortLabel: "Partially Supported",
    description:
      "The statement contains elements of truth, but some claims are unverified, exaggerated, or inaccurate.",
  },
  MISLEADING_CONTEXT: {
    id: "MISLEADING_CONTEXT",
    label: "Misleading Context",
    shortLabel: "Misleading Context",
    description:
      "The information is factually real but presented without critical context, creating a false impression.",
  },
  INSUFFICIENT_EVIDENCE: {
    id: "INSUFFICIENT_EVIDENCE",
    label: "Insufficient Evidence",
    shortLabel: "Insufficient Evidence",
    description:
      "Available reliable evidence is insufficient to confirm or refute the claim definitively.",
  },
});

export const CANONICAL_VERDICT_IDS = Object.freeze(Object.keys(VERDICTS));

export const CLAIM_STATUS = Object.freeze({
  UNDER_REVIEW: "UNDER_REVIEW",
  IN_VERIFICATION: "IN_VERIFICATION",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
});

export const CLAIM_STATUS_LIST = Object.freeze(Object.values(CLAIM_STATUS));

export const USER_ROLES = Object.freeze({
  USER: "user",
  REVIEWER: "reviewer",
  ADMIN: "admin",
});

export const USER_ROLES_LIST = Object.freeze(Object.values(USER_ROLES));

export const SUPPORTED_LANGUAGES = Object.freeze([
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Other",
]);
