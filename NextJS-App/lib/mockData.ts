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
    title: "Mandatory VVPAT Physical Slip Audit Protocol",
    claimText:
      "The Election Commission mandates physical verification of VVPAT paper slips for randomly selected polling stations in every assembly constituency.",
    sourceUrl: "https://eci.gov.in/files/file/vvpat-counting-guidelines",
    language: "English",
    submittedDate: "2026-11-14T09:00:00Z",
    status: "COMPLETED",
    verdictId: "SUPPORTED",
    categoryTags: ["VVPAT & Counting", "Statutory Guidelines"],
    isSampleData: false,
    verificationReport: {
      verdictId: "SUPPORTED",
      summary:
        "Official guidelines require mandatory physical verification of paper slips from 5 randomly selected VVPAT units per constituency before final certificate issuance.",
      assessment:
        "Statutory counting manuals and Supreme Court directives affirm mandatory 5-polling-station physical audits per constituency.",
      evidenceAssessment:
        "Direct regulatory mandate published under official election counting guidelines.",
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
      sources: [],
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
    status: "COMPLETED",
    verdictId: "PARTIALLY_SUPPORTED",
    categoryTags: ["Voter Identification", "Polling Guidelines"],
    isSampleData: false,
    verificationReport: {
      verdictId: "PARTIALLY_SUPPORTED",
      summary:
        "Alternative identification documents are accepted; however, the voter must already be registered in the official electoral roll of that specific polling station.",
      assessment:
        "While alternative photo IDs (such as Passport, Aadhaar, Driving License) are approved, presence on the electoral roll remains a non-negotiable prerequisite.",
      evidenceAssessment:
        "Statutory list of 12 approved documents applies strictly to electors whose names appear in the certified electoral rolls.",
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
    submittedDate: "2026-11-12T11:15:00Z",
    status: "COMPLETED",
    verdictId: "CONTRADICTED",
    categoryTags: ["Vote Counting", "Security Protocols"],
    isSampleData: false,
    verificationReport: {
      verdictId: "CONTRADICTED",
      summary:
        "Documented counting rules strictly prohibit unsealing or tallying control units without appointed candidate agents signing verification seals.",
      assessment:
        "Standard operating protocols mandate presence and signatures of polling agents representing all contesting candidates throughout the counting cycle.",
      evidenceAssessment:
        "Returning officers must display unviolated seals to counting agents before pressing the Result button on the control unit.",
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
    status: "COMPLETED",
    verdictId: "MISLEADING_CONTEXT",
    categoryTags: ["Media Context", "Viral Claims"],
    isSampleData: false,
    verificationReport: {
      verdictId: "MISLEADING_CONTEXT",
      summary:
        "Authentic archival video footage from the 2019 general election has been recirculated with false timestamps claiming to represent current events.",
      assessment:
        "Reverse visual analysis matches keyframes to a documented rain delay incident from the 2019 electoral cycle, having no relation to the ongoing phase.",
      evidenceAssessment:
        "Archival broadcast footage and returning officer reports confirm the footage was filmed in April 2019.",
      supportingEvidence: [
        {
          id: "ev-05",
          title: "Archival Broadcast Footage (April 2019)",
          description:
            "Identical background banners, polling personnel, and weather conditions recorded and published in 2019 archives.",
          relevance: "Chronological disproof of recent origin.",
        },
      ],
      contradictingEvidence: [],
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
    submittedDate: "2026-11-10T10:20:00Z",
    status: "COMPLETED",
    verdictId: "INSUFFICIENT_EVIDENCE",
    categoryTags: ["Voting Equipment", "Unconfirmed Reports"],
    isSampleData: false,
    verificationReport: {
      verdictId: "INSUFFICIENT_EVIDENCE",
      summary:
        "Multi-source factual queries and district election authority incident logs found zero records corroborating widespread hardware malfunctions.",
      assessment:
        "No specific polling booth, returning officer report, or formal observer complaint has been filed to corroborate this assertion.",
      evidenceAssessment:
        "District election officer logs and technical observer reports confirm normal polling operations across all divisions.",
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
    submittedDate: "2026-11-14T08:00:00Z",
    status: "UNDER_REVIEW",
    verdictId: null,
    categoryTags: ["Voter Assistance", "Helpline"],
    isSampleData: false,
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
