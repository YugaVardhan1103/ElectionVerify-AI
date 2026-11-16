# Responsible AI Safeguards — ElectionVerify AI

This document outlines the ethical standards, anti-hallucination protocols, civic integrity guidelines, and human-in-the-loop safeguards embedded into **ElectionVerify AI**.

---

## 1. Principles of Civic Integrity

Elections are fundamental democratic institutions. Presenting unreliable, speculative, or fabricated automated findings poses direct risks to voter participation and public trust.

To protect civic discourse, ElectionVerify AI operates under five foundational safeguards:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Civic Integrity Safeguards                        │
 ├────────────────────────────────┬───────────────────────────────────────┤
 │ 1. Zero Tolerance for Fake Citations   │ Never generate artificial URLs│
 │ 2. No Synthetic Confidence Percentages │ Qualitative categories only   │
 │ 3. Mandatory Human Review Queues       │ Flag uncertainty for experts  │
 │ 4. Explicit UI Transparency Notices    │ Clarify demo vs live data     │
 │ 5. Assistive Role Only                 │ AI never replaces authorities │
 └────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Specific Safeguard Protocols

### 2.1 Prohibition of Fabricated Citations
Many LLMs tend to generate convincing but non-existent URLs and citations ("hallucinated links").
- **Platform Policy:** Every citation displayed in a `VerificationReport` must originate from an authentic indexed document retrieved by `evidenceRetrievalService`.
- **Enforcement:** If no authoritative documents were retrieved during search, the `sources` array remains strictly empty (`sources: []`), and an explicit notice is presented: *"No external sources are cited for this record."*
- **Mock Data Honesty:** In all demonstration datasets, `sources: []` is strictly maintained rather than fabricating fake news links.

### 2.2 Rejection of Pseudo-Mathematical Confidence Scores
In election fact-checking, assigning an arbitrary percentage score (e.g. *"Claim is 87% accurate"*) misleads users by creating a false impression of scientific measurement.
- **Platform Policy:** Verification findings are classified strictly into one of the **5 Canonical Verdicts**:
  1. `SUPPORTED` (Supported by Evidence)
  2. `CONTRADICTED` (Contradicted by Evidence)
  3. `PARTIALLY_SUPPORTED` (Partially Supported)
  4. `MISLEADING_CONTEXT` (Misleading Context)
  5. `INSUFFICIENT_EVIDENCE` (Insufficient Evidence)
- Numerical confidence percentages are never presented in the UI or API.

### 2.3 Transparent Demarcation of Sample Records
To prevent test or preview records from being misinterpreted as authentic real-world investigations:
- Sample claims are explicitly flagged with `isSampleData: true`.
- Frontends render visible badges: `Demo` or `Demonstration Record`.
- Verification result views feature prominent transparency banners emphasizing that demonstration fixtures are for UI evaluation and not real-world election proclamations.

### 2.4 Human-in-the-Loop Oversight
AI is strictly assistive. Authorized human reviewers (e.g. election analysts, certified fact-checkers) have full administrative control:
- Human reviewers can audit automated findings via `/api/verification/claims/:id/review`.
- Reviewers can override machine verdicts, attach official gazette reference numbers, and record factual audit notes.
- In all reports with human review, the reviewer's findings are displayed prominently above automated outputs.

### 2.5 Clear Statutory Authority Precedence
- The platform makes clear in all verification results that **only official statutory bodies** (e.g. Election Commissions, Electoral Management Bodies, Gazette Notifications) issue legally binding election rules, polling schedules, and ballot procedures.
