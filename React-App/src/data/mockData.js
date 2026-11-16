/**
 * ElectionVerify AI - Centralized Frontend Mock Data
 *
 * IMPORTANT ARCHITECTURAL & ETHICAL NOTICE:
 * - All records in this file are purely illustrative UI demonstration fixtures.
 * - None of these records represent actual election verification findings,
 *   authentic investigations, or retrieved real-world evidence.
 * - Sources are strictly empty arrays (`sources: []`).
 * - Numerical confidence percentages are NOT simulated.
 * - Actual verification, evidence discovery, and fact-checking will be performed
 *   by the future backend and AI verification engine.
 */

import { VERDICTS } from "../constants/verdicts.js";

/**
 * Recursively freezes an object and its nested properties to guarantee complete immutability.
 *
 * @param {object} obj - Object or array to deeply freeze
 * @returns {object} The frozen object
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  Object.keys(obj).forEach((prop) => {
    if (
      typeof obj[prop] === "object" &&
      obj[prop] !== null &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });

  return Object.freeze(obj);
}

/**
 * Claim Processing Lifecycle States.
 * Kept strictly separate from verification verdicts.
 */
export const CLAIM_STATUS = Object.freeze({
  UNDER_REVIEW: "UNDER_REVIEW",
  IN_VERIFICATION: "IN_VERIFICATION",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
});

/**
 * Standard Demo User Profile.
 * Uses the RFC 2606 reserved ".invalid" TLD to ensure no real email is represented.
 */
export const DEMO_USER = deepFreeze({
  id: "usr_demo_01",
  name: "Demo User",
  email: "demo.user@example.invalid",
  role: "Registered User",
  accountStatus: "Active",
  joinedDate: "2026-10-15T08:00:00Z",
  preferences: {
    preferredLanguage: "English",
    theme: "System",
    notifications: {
      emailNotifications: true,
      resultNotifications: true,
      announcementNotifications: false,
    },
  },
});

/**
 * Supported Languages List.
 * Shared between Claim Submission and User Profile Preferences.
 */
export const SUPPORTED_LANGUAGES = deepFreeze([
  { code: "English", label: "English" },
  { code: "Hindi", label: "Hindi" },
  { code: "Telugu", label: "Telugu" },
  { code: "Tamil", label: "Tamil" },
  { code: "Kannada", label: "Kannada" },
  { code: "Malayalam", label: "Malayalam" },
  { code: "Other", label: "Other" },
]);

/**
 * Illustrative Sample Claims.
 * Six sample claims covering all 5 official verdicts and 1 under-review claim.
 */
export const SAMPLE_CLAIMS = deepFreeze([
  {
    id: "claim-001",
    title: "Sample Claim: Polling Station Operating Hours",
    claimText:
      "Sample election-related statement regarding polling station operating hours (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-14T09:15:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.SUPPORTED.id,
    categoryTags: ["Polling Schedule", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      summary:
        "[UI Demonstration] Illustrative summary explaining how evidence supports the statement.",
      evidenceAssessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [
        {
          id: "ev-01",
          title: "[UI Demonstration] Sample Supporting Information Card",
          description:
            "Template placeholder demonstrating how supporting evidence information will be structured in the verification report.",
          relevance: "UI layout demonstration only.",
        },
      ],
      contradictingEvidence: [],
      sources: [],
    },
  },
  {
    id: "claim-002",
    title: "Sample Claim: Voter Photo Identification Requirements",
    claimText:
      "Sample election-related statement regarding accepted photo identification documents (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-13T14:30:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.PARTIALLY_SUPPORTED.id,
    categoryTags: ["Voter ID", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      summary:
        "[UI Demonstration] Illustrative summary explaining how certain details are supported while others require clarification.",
      evidenceAssessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [
        {
          id: "ev-02",
          title: "[UI Demonstration] Sample Supporting Information Card",
          description:
            "Template placeholder demonstrating how partially supporting information is presented.",
          relevance: "UI layout demonstration only.",
        },
      ],
      contradictingEvidence: [
        {
          id: "ev-03",
          title: "[UI Demonstration] Sample Clarifying Information Card",
          description:
            "Template placeholder demonstrating how conflicting or clarifying information is presented.",
          relevance: "UI layout demonstration only.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-003",
    title: "Sample Claim: Ballot Counting Procedure Changes",
    claimText:
      "Sample election-related statement alleging unannounced modifications to vote-counting rules (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-12T11:00:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.CONTRADICTED.id,
    categoryTags: ["Vote Counting", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      summary:
        "[UI Demonstration] Illustrative summary explaining how documented procedures contradict the statement.",
      evidenceAssessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [],
      contradictingEvidence: [
        {
          id: "ev-04",
          title: "[UI Demonstration] Sample Contradicting Information Card",
          description:
            "Template placeholder demonstrating how contradicting evidence information will be structured in the verification report.",
          relevance: "UI layout demonstration only.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-004",
    title: "Sample Claim: Historical Polling Station Queue Image",
    claimText:
      "Sample election-related statement presenting historical election footage as current events (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-11T16:45:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.MISLEADING_CONTEXT.id,
    categoryTags: ["Media Context", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      summary:
        "[UI Demonstration] Illustrative summary explaining that authentic media has been framed in a misleading temporal context.",
      evidenceAssessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [],
      contradictingEvidence: [
        {
          id: "ev-05",
          title: "[UI Demonstration] Sample Contextual Information Card",
          description:
            "Template placeholder demonstrating how chronological and contextual clarifications are structured.",
          relevance: "UI layout demonstration only.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-005",
    title: "Sample Claim: Unsubstantiated Local Polling Rumor",
    claimText:
      "Sample election-related statement circulating unverified claims about localized booth logistics (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-10T08:20:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id,
    categoryTags: ["Unverified Claims", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      summary:
        "[UI Demonstration] Illustrative summary communicating that available evidence is currently insufficient to confirm or refute the claim.",
      evidenceAssessment:
        "Illustrative uncertainty notice communicating lack of sufficient evidence.",
      supportingEvidence: [],
      contradictingEvidence: [],
      sources: [],
    },
  },
  {
    id: "claim-006",
    title: "Sample Claim: Voter Assistance Helpline Inquiry",
    claimText:
      "Sample election-related statement submitted recently and currently awaiting verification (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-14T10:00:00Z",
    status: CLAIM_STATUS.UNDER_REVIEW,
    verdictId: null, // Strictly null: Under Review is a lifecycle state, NOT a verdict
    categoryTags: ["Helpline", "UI Preview"],
    isSampleData: true,
    verificationReport: null, // No report while under review
  },
]);

/**
 * Derived Statistics.
 * Computed directly from SAMPLE_CLAIMS to ensure Dashboard and History are in exact agreement.
 */
export const SAMPLE_STATS = deepFreeze({
  totalClaims: SAMPLE_CLAIMS.length, // 6
  completedVerifications: SAMPLE_CLAIMS.filter(
    (c) => c.status === CLAIM_STATUS.COMPLETED
  ).length, // 5
  underReview: SAMPLE_CLAIMS.filter(
    (c) => c.status === CLAIM_STATUS.UNDER_REVIEW
  ).length, // 1
  byVerdict: {
    SUPPORTED: SAMPLE_CLAIMS.filter(
      (c) => c.verdictId === VERDICTS.SUPPORTED.id
    ).length, // 1
    CONTRADICTED: SAMPLE_CLAIMS.filter(
      (c) => c.verdictId === VERDICTS.CONTRADICTED.id
    ).length, // 1
    PARTIALLY_SUPPORTED: SAMPLE_CLAIMS.filter(
      (c) => c.verdictId === VERDICTS.PARTIALLY_SUPPORTED.id
    ).length, // 1
    MISLEADING_CONTEXT: SAMPLE_CLAIMS.filter(
      (c) => c.verdictId === VERDICTS.MISLEADING_CONTEXT.id
    ).length, // 1
    INSUFFICIENT_EVIDENCE: SAMPLE_CLAIMS.filter(
      (c) => c.verdictId === VERDICTS.INSUFFICIENT_EVIDENCE.id
    ).length, // 1
  },
});

/**
 * Retrieves a single sample claim by its ID.
 * Returns null if the ID is missing, non-string, or not found.
 *
 * @param {string} id - Unique claim identifier (e.g. "claim-001")
 * @returns {object|null} Matching claim object or null
 */
export function getSampleClaimById(id) {
  if (!id || typeof id !== "string") {
    return null;
  }
  const cleanId = id.trim();
  return SAMPLE_CLAIMS.find((claim) => claim.id === cleanId) || null;
}

/**
 * Retrieves the most recent sample claims sorted by submittedDate (newest first).
 * Sanitizes input to ensure an integer limit. Does not mutate the source dataset.
 *
 * @param {number} [limit=3] - Number of claims to return
 * @returns {Array<object>} New array of recent sample claims
 */
export function getRecentSampleClaims(limit = 3) {
  const numeric =
    typeof limit === "number" ? Math.floor(limit) : parseInt(limit, 10);
  const safeLimit = Number.isInteger(numeric) && numeric > 0 ? numeric : 3;

  return [...SAMPLE_CLAIMS]
    .sort((a, b) => Date.parse(b.submittedDate) - Date.parse(a.submittedDate))
    .slice(0, safeLimit);
}

/**
 * Filters and searches sample claims without mutating the source dataset.
 * Verdict and processing-status filters are strictly separate parameters.
 *
 * @param {object} [options]
 * @param {string} [options.searchTerm=""] - Query matched case-insensitively against title and claimText
 * @param {string} [options.verdictId="ALL"] - Filter by official verdict ID or "ALL"
 * @param {string} [options.status="ALL"] - Filter by CLAIM_STATUS or "ALL"
 * @returns {Array<object>} New array of filtered claims, sorted by submittedDate descending
 */
export function getFilteredSampleClaims(options = {}) {
  const safeOptions = options && typeof options === "object" ? options : {};
  const { searchTerm = "", verdictId = "ALL", status = "ALL" } = safeOptions;

  const query =
    typeof searchTerm === "string" ? searchTerm.trim().toLowerCase() : "";
  const targetVerdict =
    typeof verdictId === "string" ? verdictId.trim().toUpperCase() : "ALL";
  const targetStatus =
    typeof status === "string" ? status.trim().toUpperCase() : "ALL";

  return [...SAMPLE_CLAIMS]
    .filter((claim) => {
      // 1. Search term match (title or claimText)
      const matchesSearch =
        !query ||
        claim.title.toLowerCase().includes(query) ||
        claim.claimText.toLowerCase().includes(query);

      // 2. Verdict filter (independent)
      const matchesVerdict =
        targetVerdict === "ALL" || claim.verdictId === targetVerdict;

      // 3. Processing status filter (independent)
      const matchesStatus =
        targetStatus === "ALL" || claim.status === targetStatus;

      return matchesSearch && matchesVerdict && matchesStatus;
    })
    .sort((a, b) => Date.parse(b.submittedDate) - Date.parse(a.submittedDate));
}
