# AI Verification Workflow — ElectionVerify AI

This document details the AI-assisted verification pipeline, provider factory architecture, evidence retrieval mechanics, prompt governance, and the explainability standards implemented in **ElectionVerify AI**.

---

## 1. Pipeline Architecture

The automated verification pipeline runs when triggered by reviewers/admins or via claim submission when `autoVerify=true`:

```text
 1. Claim Ingestion
    └── Status set to 'IN_VERIFICATION'
            │
            ▼
 2. Evidence Retrieval (evidenceRetrievalService.js)
    ├── Query generation from claim statement & context
    ├── Search execution (Google Custom Search or Authority Feeds)
    └── Domain Trust Classification (Authority > Fact-Checker > News)
            │
            ▼
 3. Provider Resolution (aiProviderFactory.js)
    ├── Checks AI_PROVIDER ('gemini', 'openai', or 'auto')
    ├── Auto mode: picks Gemini if configured, else OpenAI
    └── Fallback: UnconfiguredProvider (generates transparent INSUFFICIENT_EVIDENCE notice)
            │
            ▼
 4. Semantic Reasoning & Evidence Comparison
    ├── System prompt enforces strict neutral tone
    ├── Schema validation: exactly 1 of 5 canonical verdicts
    └── Extraction of supporting vs contradicting points
            │
            ▼
 5. Report Synthesis & Persistence
    ├── VerificationReport document created/updated in MongoDB
    ├── Claim verdictId assigned
    └── Status updated: 'COMPLETED' (or 'UNDER_REVIEW' if unconfigured)
```

---

## 2. Pluggable AI Provider Architecture

The backend implements the Adapter pattern (`BaseAiProvider`), allowing transparent switching between LLM vendors without impacting application logic:

### 2.1 Google Gemini Provider (`geminiProvider.js`)
- **Default Model:** `gemini-1.5-flash` (configurable via `GEMINI_MODEL`).
- **Protocol:** Google Generative AI SDK (`@google/genai` or direct REST).
- **Features:** High context window, native support for multilingual election inquiries (English, Hindi, Telugu, Tamil, etc.).

### 2.2 OpenAI Provider (`openaiProvider.js`)
- **Default Model:** `gpt-4o-mini` (configurable via `OPENAI_MODEL`).
- **Protocol:** OpenAI REST client with structured JSON output formatting (`response_format: { type: "json_object" }`).

### 2.3 Unconfigured Provider (`unconfiguredProvider.js`)
- **Role:** Fallback provider invoked when no API keys are present in `.env`.
- **Behavior:**
  - Never crashes or throws 500 errors.
  - Never generates fake AI reasoning or artificial citations.
  - Generates a transparent administrative notice:
    > *"Automated verification pipeline requires external AI provider configuration... In adherence to our strict transparency guidelines, this record has been marked with the canonical verdict 'Insufficient Evidence' and queued for human reviewer triage."*
  - Sets verdict to `INSUFFICIENT_EVIDENCE` and keeps claim in `UNDER_REVIEW`.

---

## 3. Evidence Retrieval & Domain Trust Classification

Evidence is retrieved through `evidenceRetrievalService.js` and scored against trusted domain registries:

```text
                               Domain Check
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
Statutory Election Bodies    Fact-Checking Orgs          Major News Media
(eci.gov.in, fvpa.gov, etc.) (pib.gov.in, altnews.in,    (reuters.com, apnews.com,
Domain Trust: 1.0            snopes.com, factcheck.org)   bbc.com, thehindu.com)
                             Domain Trust: 0.9           Domain Trust: 0.8
```

---

## 4. Prompt Governance & Neutrality Rules

LLM prompts are designed with strict constraints to protect democratic integrity:

1. **Non-Partisanship:** Prompts explicitly forbid partisan language, emotional appeals, and political speculation.
2. **Grounding Requirement:** The LLM is instructed to reason **exclusively** from provided evidence. If retrieved evidence is inconclusive, it must return `INSUFFICIENT_EVIDENCE`.
3. **No Synthetic Confidence Scores:** The system strictly prohibits numerical percentage confidence scores (e.g., "94.2% true"). Such scores convey a misleading illusion of mathematical precision. Instead, qualitative evidence categorizations (`SUPPORTED`, `CONTRADICTED`, `PARTIALLY_SUPPORTED`, `MISLEADING_CONTEXT`, `INSUFFICIENT_EVIDENCE`) are used.
4. **Structured JSON Output:** The model is required to return a strictly typed JSON payload matching the canonical schema.
