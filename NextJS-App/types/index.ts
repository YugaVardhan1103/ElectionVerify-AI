export type CanonicalVerdictId =
  | "SUPPORTED"
  | "CONTRADICTED"
  | "PARTIALLY_SUPPORTED"
  | "MISLEADING_CONTEXT"
  | "INSUFFICIENT_EVIDENCE";

export type ClaimProcessingStatus =
  | "UNDER_REVIEW"
  | "IN_VERIFICATION"
  | "COMPLETED"
  | "REJECTED";

export interface VerdictDefinition {
  id: CanonicalVerdictId;
  label: string;
  shortLabel: string;
  description: string;
  textColor: string;
  badgeClass: string;
  borderClass: string;
  dotClass: string;
}

export interface UserPreferences {
  preferredLanguage: string;
  theme: "Light" | "Dark" | "System";
  notifications: {
    emailNotifications: boolean;
    resultNotifications: boolean;
    announcementNotifications: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "reviewer" | "admin";
  accountStatus: string;
  avatarUrl?: string | null;
  authProvider?: string;
  joinedDate?: string;
  preferences: UserPreferences;
}

export interface EvidenceItem {
  id?: string;
  title: string;
  description: string;
  sourceUrl?: string;
  publisher?: string;
  publicationDate?: string | null;
  relevance?: string;
}

export interface EvidenceSource {
  url: string;
  title?: string;
  publisher?: string;
  publicationDate?: string | null;
  retrievalDate?: string;
  snippet?: string;
  domainTrust?: string;
  reliabilityScore?: number | null;
}

export interface VerificationReportData {
  _id?: string;
  id?: string;
  claim?: string;
  verdictId: CanonicalVerdictId;
  summary: string;
  assessment: string;
  evidenceAssessment?: string;
  supportingEvidence: EvidenceItem[];
  contradictingEvidence: EvidenceItem[];
  sources: EvidenceSource[];
  aiMetadata?: {
    provider: string;
    model: string;
    executionTimeMs?: number;
    isConfigured: boolean;
    verificationDate?: string;
  };
  humanReview?: {
    isReviewed: boolean;
    reviewer?: string | null;
    notes?: string;
    reviewedAt?: string | null;
  };
}

export interface ClaimItem {
  _id?: string;
  id: string;
  title: string;
  claimText: string;
  sourceUrl?: string;
  language: string;
  context?: string;
  submittedBy?: string | null;
  submittedDate: string;
  status: ClaimProcessingStatus;
  verdictId: CanonicalVerdictId | null;
  categoryTags?: string[];
  verificationReport?: VerificationReportData | null;
  isSampleData?: boolean;
}

export interface ClaimStats {
  totalClaims: number;
  completedVerifications: number;
  underReview: number;
  inVerification?: number;
  rejected?: number;
  byVerdict: Record<CanonicalVerdictId, number>;
}
