import { ClaimItem, ClaimStats, UserProfile } from "@/types";

export const DEMO_USER: UserProfile = {
  id: "usr_demo_01",
  name: "Demo User",
  email: "demo.user@example.invalid",
  role: "user",
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
};

export const BASELINE_SAMPLE_CLAIMS: ClaimItem[] = [
  {
    id: "claim-001",
    title: "Sample Claim: Polling Station Operating Hours",
    claimText:
      "Sample election-related statement regarding polling station operating hours (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-14T09:00:00Z",
    status: "COMPLETED",
    verdictId: "SUPPORTED",
    categoryTags: ["Polling Hours", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      verdictId: "SUPPORTED",
      summary:
        "[UI Demonstration] Illustrative summary describing how available reliable sources support the claim statement.",
      assessment:
        "This is an illustrative verification report created for UI preview purposes. In a production environment, this assessment details verified findings.",
      evidenceAssessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [
        {
          id: "ev-01",
          title: "[UI Demonstration] Sample Supporting Information Card",
          description:
            "Template placeholder demonstrating how supporting information is presented.",
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
    status: "COMPLETED",
    verdictId: "PARTIALLY_SUPPORTED",
    categoryTags: ["Voter ID", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      verdictId: "PARTIALLY_SUPPORTED",
      summary:
        "[UI Demonstration] Illustrative summary explaining how certain details are supported while others require clarification.",
      assessment:
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
      "Sample election-related statement asserting an unannounced change to standard ballot tallying rules (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-12T11:15:00Z",
    status: "COMPLETED",
    verdictId: "CONTRADICTED",
    categoryTags: ["Ballot Counting", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      verdictId: "CONTRADICTED",
      summary:
        "[UI Demonstration] Illustrative summary explaining that available reliable sources contradict the circulating statement.",
      assessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [],
      contradictingEvidence: [
        {
          id: "ev-04",
          title: "[UI Demonstration] Sample Contradicting Information Card",
          description:
            "Template placeholder demonstrating how contradictory findings are displayed.",
          relevance: "UI layout demonstration only.",
        },
      ],
      sources: [],
    },
  },
  {
    id: "claim-004",
    title: "Sample Claim: Outdated Voter Turnout Statistics",
    claimText:
      "Sample election-related statement presenting previous election turnout figures as current data (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-11T16:45:00Z",
    status: "COMPLETED",
    verdictId: "MISLEADING_CONTEXT",
    categoryTags: ["Voter Turnout", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      verdictId: "MISLEADING_CONTEXT",
      summary:
        "[UI Demonstration] Illustrative summary explaining how accurate historical figures can create a misleading impression when presented without proper context.",
      assessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [
        {
          id: "ev-05",
          title: "[UI Demonstration] Sample Contextual Information Card",
          description:
            "Template placeholder demonstrating contextual background information.",
          relevance: "UI layout demonstration only.",
        },
      ],
      contradictingEvidence: [],
      sources: [],
    },
  },
  {
    id: "claim-005",
    title: "Sample Claim: Unverified Early Voting Machine Malfunction",
    claimText:
      "Sample election-related statement alleging isolated voting equipment irregularities at an unspecified location (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-10T10:20:00Z",
    status: "COMPLETED",
    verdictId: "INSUFFICIENT_EVIDENCE",
    categoryTags: ["Voting Equipment", "UI Preview"],
    isSampleData: true,
    verificationReport: {
      verdictId: "INSUFFICIENT_EVIDENCE",
      summary:
        "[UI Demonstration] Illustrative summary explaining that available reliable evidence is insufficient to verify or refute the claim.",
      assessment:
        "Illustrative sample assessment note for UI demonstration only.",
      supportingEvidence: [],
      contradictingEvidence: [],
      sources: [],
    },
  },
  {
    id: "claim-006",
    title: "Sample Claim: Newly Circulating Voter Registration Notice",
    claimText:
      "Sample election-related statement recently submitted and pending investigation (for UI demonstration).",
    sourceUrl: "",
    language: "English",
    submittedDate: "2026-11-14T08:00:00Z",
    status: "UNDER_REVIEW",
    verdictId: null,
    categoryTags: ["Voter Registration", "UI Preview"],
    isSampleData: true,
    verificationReport: null,
  },
];

export const BASELINE_STATS: ClaimStats = {
  totalClaims: 6,
  completedVerifications: 5,
  underReview: 1,
  byVerdict: {
    SUPPORTED: 1,
    CONTRADICTED: 1,
    PARTIALLY_SUPPORTED: 1,
    MISLEADING_CONTEXT: 1,
    INSUFFICIENT_EVIDENCE: 1,
  },
};
