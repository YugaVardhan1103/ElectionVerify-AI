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
    title: "Mandatory VVPAT Physical Slip Audit Protocol",
    claimText:
      "The Election Commission mandates physical verification of VVPAT paper slips for randomly selected polling stations in every assembly constituency.",
    sourceUrl: "https://eci.gov.in/files/file/vvpat-counting-guidelines",
    language: "English",
    submittedDate: "2026-11-14T09:15:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.SUPPORTED.id,
    categoryTags: ["VVPAT & Counting", "Statutory Guidelines"],
    isSampleData: false,
    verificationReport: {
      summary:
        "Official guidelines require mandatory physical verification of paper slips from 5 randomly selected VVPAT units per constituency before final certificate issuance.",
      evidenceAssessment:
        "Statutory counting manuals and Supreme Court directives affirm mandatory 5-polling-station physical audits per constituency.",
      supportingEvidence: [
        {
          id: "ev-01",
          title: "Election Commission Counting Manual (Section 16.4)",
          description:
            "Mandatory physical counting of VVPAT slips in five randomly chosen polling stations per legislative assembly segment.",
          relevance: "Direct statutory regulatory mandate.",
        },
      ],
      contradictingEvidence: [],
      sources: [
        {
          title: "Election Commission Official Manual on EVM and VVPAT",
          url: "https://eci.gov.in/evm-vvpat-manual",
          domainTrustLevel: "Statutory Election Authority",
        },
      ],
    },
  },
  {
    id: "claim-002",
    title: "Voter Photo Identification Alternative Documents",
    claimText:
      "Voters unable to produce their official Voter ID (EPIC) may vote by presenting any of 12 designated government photo identity documents.",
    sourceUrl: "https://eci.gov.in/voter-id-alternatives",
    language: "English",
    submittedDate: "2026-11-13T14:30:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.PARTIALLY_SUPPORTED.id,
    categoryTags: ["Voter Identification", "Polling Guidelines"],
    isSampleData: false,
    verificationReport: {
      summary:
        "Alternative identification documents are accepted; however, the voter must already be registered in the official electoral roll of that specific polling station.",
      evidenceAssessment:
        "While alternative photo IDs (such as Passport, Aadhaar, Driving License) are approved, presence on the electoral roll remains a non-negotiable prerequisite.",
      supportingEvidence: [
        {
          id: "ev-02",
          title: "Gazette Notification on Alternative Photo Identification",
          description:
            "Statutory list of 12 approved identity documents for electors not possessing an Electors Photo Identity Card.",
          relevance: "Authoritative identification allowance rule.",
        },
      ],
      contradictingEvidence: [
        {
          id: "ev-03",
          title: "Registration Prerequisite Requirement",
          description:
            "Alternative identification alone is insufficient without confirmed registration on the certified booth voter list.",
          relevance: "Clarifying procedural limitation.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-003",
    title: "Ballot Counting and Control Unit Sealing Protocols",
    claimText:
      "Unannounced modifications have been introduced allowing election officials to unseal EVM control units without candidate polling agent witnesses.",
    sourceUrl: "https://socialmedia.example/post/counting-rumor",
    language: "English",
    submittedDate: "2026-11-12T11:00:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.CONTRADICTED.id,
    categoryTags: ["Vote Counting", "Security Protocols"],
    isSampleData: false,
    verificationReport: {
      summary:
        "Documented counting rules strictly prohibit unsealing or tallying control units without appointed candidate agents signing verification seals.",
      evidenceAssessment:
        "Standard operating protocols mandate presence and signatures of polling agents representing all contesting candidates throughout the counting cycle.",
      supportingEvidence: [],
      contradictingEvidence: [
        {
          id: "ev-04",
          title: "Conduct of Elections Rules (Rule 56C)",
          description:
            "Returning officers must display unviolated seals to counting agents before pressing the Result button on the control unit.",
          relevance: "Direct contradiction of unmonitored counting allegation.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-004",
    title: "Historical Polling Station Queue Video Circulated as Current",
    claimText:
      "Viral footage claiming to depict severe voter suppression and booth blocking during the current election phase.",
    sourceUrl: "https://news.example/social-video-archive",
    language: "English",
    submittedDate: "2026-11-11T16:45:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.MISLEADING_CONTEXT.id,
    categoryTags: ["Media Context", "Viral Claims"],
    isSampleData: false,
    verificationReport: {
      summary:
        "Authentic archival video footage from the 2019 general election has been recirculated with false timestamps claiming to represent current events.",
      evidenceAssessment:
        "Reverse visual analysis matches keyframes to a documented rain delay incident from the 2019 electoral cycle, having no relation to the ongoing phase.",
      supportingEvidence: [],
      contradictingEvidence: [
        {
          id: "ev-05",
          title: "Archival Broadcast Footage (April 2019)",
          description:
            "Identical background banners, polling personnel, and weather conditions recorded and published in 2019 archives.",
          relevance: "Chronological disproof of recent origin.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-005",
    title: "Unsubstantiated Local Booth Malfunction Allegation",
    claimText:
      "Social media reports claiming widespread voting machine breakdown at an unspecified constituency.",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-10T08:20:00Z",
    status: CLAIM_STATUS.COMPLETED,
    verdictId: VERDICTS.INSUFFICIENT_EVIDENCE.id,
    categoryTags: ["Voting Equipment", "Unconfirmed Reports"],
    isSampleData: false,
    verificationReport: {
      summary:
        "Multi-source factual queries and district election authority incident logs found zero records corroborating widespread hardware malfunctions.",
      evidenceAssessment:
        "No specific polling booth, returning officer report, or formal observer complaint has been filed to corroborate this assertion.",
      supportingEvidence: [],
      contradictingEvidence: [],
      sources: [],
    },
  },
  {
    id: "claim-006",
    title: "Voter Registration Toll-Free Helpline Schedule",
    claimText:
      "Voter assistance helpline 1950 operates 24/7 with multi-lingual support during active election periods.",
    sourceUrl: "https://eci.gov.in/helpline-1950",
    language: "English",
    submittedDate: "2026-11-14T10:00:00Z",
    status: CLAIM_STATUS.UNDER_REVIEW,
    verdictId: null, // Strictly null: Under Review is a lifecycle state, NOT a verdict
    categoryTags: ["Voter Assistance", "Helpline"],
    isSampleData: false,
    verificationReport: null,
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
