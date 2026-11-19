# Database Structure — ElectionVerify AI

This document specifies the MongoDB database schema, data types, indexes, cross-collection references, and validation rules for **ElectionVerify AI**.

---

## 1. Entity-Relationship Overview

```text
  ┌─────────────────────────────────────────────────────────┐
  │                          User                           │
  ├─────────────────────────────────────────────────────────┤
  │ _id                : ObjectId                           │
  │ name               : String                             │
  │ email              : String (unique)                    │
  │ password           : String (hashed with bcrypt)        │
  │ role               : Enum ['user','reviewer','admin']   │
  │ accountStatus      : Enum ['Active','Suspended']        │
  │ preferences        : Embedded Subdocument               │
  │ timestamps         : createdAt, updatedAt               │
  └────────────────────────────┬────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │ 1:N (submittedBy)                   │ 1:N (reviewer)
            ▼                                     ▼
  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
  │              Claim              │   │       VerificationReport        │
  ├─────────────────────────────────┤   ├─────────────────────────────────┤
  │ _id             : ObjectId      │1:1│ _id            : ObjectId       │
  │ title           : String        │◀─▶│ claim          : Ref -> Claim   │
  │ claimText       : String        │   │ verdictId      : Enum (5 values)│
  │ sourceUrl       : String        │   │ summary        : String         │
  │ language        : Enum (8 langs)│   │ assessment     : String         │
  │ context         : String        │   │ evidenceAssess : String         │
  │ submittedBy     : Ref -> User   │   │ supportingEvid : [EvidenceItem] │
  │ submittedDate   : Date          │   │ contradicting  : [EvidenceItem] │
  │ status          : Enum (4 stats)│   │ sources        : [EvidenceSrc]  │
  │ verdictId       : Enum | null   │   │ aiMetadata     : Embedded       │
  │ categoryTags    : [String]      │   │ humanReview    : Embedded       │
  │ verificationRep : Ref -> Report │   │ timestamps     : created, updated│
  └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 2. Model Schemas & Specifications

### 2.1 User Model (`User.js`)
Stores platform accounts, credentials, and user preferences.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Yes | Auto | Unique MongoDB Document ID |
| `name` | `String` | Yes | — | User's full name (2–100 chars, trimmed) |
| `email` | `String` | Yes | — | User email (trimmed, lowercase, unique index) |
| `password` | `String` | Yes | — | bcrypt hashed password (salt factor 12, `select: false`) |
| `role` | `String` | Yes | `"user"` | Authorization role: `"user"`, `"reviewer"`, `"admin"` |
| `accountStatus` | `String` | Yes | `"Active"` | `"Active"` or `"Suspended"` |
| `joinedDate` | `Date` | Yes | `Date.now` | Account creation timestamp |
| `preferences` | `Object` | Yes | See below | Nested user UI preferences |
| `preferences.preferredLanguage` | `String` | No | `"English"` | Selected platform language |
| `preferences.theme` | `String` | No | `"System"` | Visual theme: `"Light"`, `"Dark"`, `"System"` |
| `preferences.notifications` | `Object` | No | `{ ... }` | Notification channel flags |
| `createdAt`, `updatedAt` | `Date` | Auto | Auto | Mongoose timestamps |

**Indexes:**
- `email`: Unique index for instantaneous lookup and collision rejection.

---

### 2.2 Claim Model (`Claim.js`)
Stores user-submitted or ingested election claims and lifecycle status.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Yes | Auto | Unique claim ID |
| `title` | `String` | Yes | — | Brief title or summarized statement (max 300 chars) |
| `claimText` | `String` | Yes | — | Full statement text (5–5,000 chars) |
| `sourceUrl` | `String` | No | `""` | Original link where claim was sighted |
| `language` | `String` | Yes | `"English"` | One of `SUPPORTED_LANGUAGES` |
| `context` | `String` | No | `""` | Background context provided by submitter (max 2,000 chars) |
| `submittedBy` | `ObjectId` | No | `null` | Reference to `User` who submitted the claim |
| `submittedDate` | `Date` | Yes | `Date.now` | Submission timestamp |
| `status` | `String` | Yes | `"UNDER_REVIEW"` | `UNDER_REVIEW`, `IN_VERIFICATION`, `COMPLETED`, `REJECTED` |
| `verdictId` | `String` | No | `null` | One of 5 canonical verdicts (null while unverified) |
| `reviewStatus` | `String` | Yes | `"AWAITING_REVIEW"` | `AWAITING_REVIEW`, `APPROVED`, `REVISED`, `REQUIRES_FURTHER_INVESTIGATION` |
| `categoryTags` | `[String]` | Yes | `["General Election"]` | Classification tags |
| `verificationReport` | `ObjectId` | No | `null` | Reference to associated `VerificationReport` |
| `createdAt`, `updatedAt` | `Date` | Auto | Auto | Timestamps |

**Indexes:**
- `{ title: "text", claimText: "text" }`: Compound text search index for fast keyword lookups.
- `status`: Index for fast filtering by lifecycle stage.
- `verdictId`: Index for fast verdict-based queries.
- `submittedDate`: Index for descending timeline sorting.

---

### 2.3 VerificationReport Model (`VerificationReport.js`)
Contains evidence assessments, citations, AI metadata, and reviewer audit trails.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Yes | Auto | Unique report ID |
| `claim` | `ObjectId` | Yes | — | Unique reference to parent `Claim` |
| `verdictId` | `String` | Yes | — | Active canonical verdict ID (`SUPPORTED`, `CONTRADICTED`, etc.) |
| `originalAiVerdictId` | `String` | Yes | — | Pristine canonical verdict from initial AI automated analysis |
| `finalVerdictId` | `String` | Yes | — | Authoritative verdict reflecting human approval or revision |
| `reviewStatus` | `String` | Yes | `"AWAITING_REVIEW"` | `AWAITING_REVIEW`, `APPROVED`, `REVISED`, `REQUIRES_FURTHER_INVESTIGATION` |
| `summary` | `String` | Yes | — | Plain-language verdict summary |
| `assessment` | `String` | Yes | — | Deep-dive analytical breakdown |
| `evidenceAssessment` | `String` | No | `""` | Methodological notes on evidence reliability |
| `supportingEvidence` | `[EvidenceItem]` | Yes | `[]` | Points corroborating elements of the claim |
| `contradictingEvidence` | `[EvidenceItem]` | Yes | `[]` | Points refuting elements of the claim |
| `sources` | `[EvidenceSource]` | Yes | `[]` | External authoritative citations |
| `aiMetadata.provider` | `String` | Yes | `"none"` | `"gemini"`, `"openai"`, `"unconfigured"` |
| `aiMetadata.model` | `String` | Yes | `"none"` | E.g., `"gemini-2.5-flash"`, `"gpt-4o-mini"` |
| `aiMetadata.executionTimeMs` | `Number` | No | `0` | Analysis pipeline duration in milliseconds |
| `aiMetadata.isConfigured` | `Boolean` | Yes | `false` | Indicates whether live LLM was active |
| `humanReview.isReviewed` | `Boolean` | Yes | `false` | True if verified or audited by human expert |
| `humanReview.decision` | `String` | Yes | `"AWAITING_REVIEW"` | `"APPROVED"`, `"REVISED"`, `"REQUIRES_FURTHER_INVESTIGATION"` |
| `humanReview.reviewer` | `ObjectId` | No | `null` | Reference to `User` with reviewer/admin role |
| `humanReview.reviewerName` | `String` | No | `""` | Display name of reviewer |
| `humanReview.revisedVerdictId` | `String` | No | `null` | Revised canonical verdict if decision is REVISED |
| `humanReview.notes` | `String` | No | `""` | Official notes and statutory gazette references |
| `humanReview.reviewedAt` | `Date` | No | `null` | Timestamp of expert review |

---

### 2.4 Evidence Source Schema (`EvidenceSource.js`)
Reusable subdocument schema representing external citations:

| Field | Type | Description |
|---|---|---|
| `url` | `String` | Canonical URL of the evidence publication |
| `title` | `String` | Headline or document title |
| `publisher` | `String` | Organization (e.g., "Election Commission", "Reuters") |
| `domainTrust` | `String` | Classification: `"election_authority"`, `"fact_checker"`, `"news_media"`, `"general"` |
| `snippet` | `String` | Relevant extracted quotation or snippet |
| `retrievalDate` | `Date` | Timestamp when citation was indexed |
