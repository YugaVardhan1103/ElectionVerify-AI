# System Architecture — ElectionVerify AI

This document details the architectural blueprint of the **ElectionVerify AI** platform, encompassing its multi-frontend design, backend service boundaries, security models, session management, and resilience patterns.

---

## 1. Architectural Philosophy

ElectionVerify AI is architected according to four core tenets:

1. **Decoupled Frontend Independence:** Two distinct frontend applications (**React SPA** powered by Vite and **Next.js App** powered by the Next.js App Router) operate independently with zero shared frontend dependencies. Both consume the same unified Shared-Backend REST API contracts.
2. **Standardized API Contracts:** Every resource, response payload, error shape, and status enumeration is centralized and enforced across all client and server boundaries.
3. **Resilient Client Fallback:** If the backend database or AI providers are temporarily offline, both frontends gracefully transition to client demonstration mode using baseline fixtures and in-memory caches, alerting users transparently via structured notices.
4. **Verifiable Truth & Strict Ethics:** Automated intelligence assists evidence gathering, but never fabricates evidence, citations, or synthetic confidence scores. Claims without conclusive data are routed to human expert review.

---

## 2. Component Architecture

### 2.1 React Single-Page Application (`React-App/`)
- **Framework & Tooling:** React 19, Vite, Tailwind CSS v4, React Router DOM v7.
- **Role:** High-performance, lightweight client-rendered application ideal for rapid single-page interactions and dynamic state transitions.
- **State Management:** React Context API (`AuthContext`, `ThemeContext`) paired with service abstraction modules (`api.js`, `authService.js`, `claimService.js`, `profileService.js`).
- **Configuration:** Independent environment variables via `.env` / `.env.local` using Vite's `VITE_` prefix (`VITE_API_URL`).

### 2.2 Next.js Fullstack Application (`NextJS-App/`)
- **Framework & Tooling:** Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS.
- **Role:** Enterprise-grade hybrid rendering frontend leveraging Server Components, dynamic streaming, and client components.
- **State Management:** React Context API (`AuthContext`, `ThemeContext`) with TypeScript-typed client services in `lib/api.ts`.
- **Configuration:** Independent environment variables via `.env` / `.env.local` using Next.js public prefix (`NEXT_PUBLIC_API_URL`).

### 2.3 Shared Express.js Backend (`Shared-Backend/`)
- **Runtime & Framework:** Node.js (ES modules), Express.js 4.
- **Data Persistence:** MongoDB via Mongoose ODM.
- **Security:** Helmet HTTP headers, strict CORS validation, bcrypt password hashing, and express-rate-limit protection.
- **AI Verification Engine:** Pluggable adapter architecture (`Google Gemini`, `OpenAI`, and `UnconfiguredProvider`).
- **Evidence Retrieval Engine:** Search API integration with domain trust scoring for election bodies, fact-checkers, and news media.

---

## 3. Session & Authentication Architecture

```text
 Client (React / Next.js)                         Shared-Backend API
   │                                                    │
   │─── POST /api/auth/login (email, password) ────────▶│
   │                                                    │ Validate & Compare bcrypt
   │◀── 200 OK (JWT Token + User Profile) ──────────────│
   │                                                    │
   │ Store JWT in client storage (localStorage)         │
   │                                                    │
   │─── GET /api/claims (Authorization: Bearer <JWT>) ─▶│
   │                                                    │ Verify JWT Signature & User
   │◀── 200 OK (Protected Data) ────────────────────────│
   │                                                    │
   │─── POST /api/auth/logout ─────────────────────────▶│
   │                                                    │
   │ Clear JWT from client storage                      │ Acknowledge cleanly
   │ Reset React/Next.js auth context                   │
```

### 3.1 Token Strategy
- **Standard:** JSON Web Tokens (JWT) signed using HMAC-SHA256 (`HS256`) with a cryptographically strong server secret (`JWT_SECRET`).
- **Payload:** Token carries user ID (`decoded.id`) and issuer timestamps. Sensitive credentials and passwords are **never** included in tokens.
- **Expiration:** Default expiration window of 7 days (`JWT_EXPIRES_IN=7d`), configurable via backend environment variables.

### 3.2 Client-Side Session Storage & Revocation
- **Storage Strategy:** Clients maintain the authentication token in browser `localStorage` under the dedicated key `electionverify_token`.
- **Header Attachment:** All authenticated requests automatically attach the standard `Authorization: Bearer <token>` header.
- **Automatic Revocation (401 Handling):** If any API call returns a `401 Unauthorized` status (e.g. token expired, malformed signature, or deleted user), both frontends immediately purge `electionverify_token` and reset client authentication state, safely routing the user to `/login`.
- **Logout Flow:** Client dispatches a `POST /api/auth/logout` call to acknowledge termination, purges the stored token, and resets the in-memory user object.

---

## 4. Canonical Statuses & Verdict Alignment

To prevent semantic drift, the system enforces strict canonical standards across all applications:

### 4.1 Canonical Verification Verdicts (`verdictId`)
| Verdict ID | Official Label | Description |
|---|---|---|
| `SUPPORTED` | Supported by Evidence | Reliable evidence directly supports the core claims made in the statement. |
| `CONTRADICTED` | Contradicted by Evidence | Reliable evidence directly contradicts the core claims made in the statement. |
| `PARTIALLY_SUPPORTED` | Partially Supported | The statement contains elements of truth, but some claims are unverified or inaccurate. |
| `MISLEADING_CONTEXT` | Misleading Context | The information is factually real but presented without critical context. |
| `INSUFFICIENT_EVIDENCE` | Insufficient Evidence | Available reliable evidence is insufficient to confirm or refute the claim definitively. |

### 4.2 Claim Processing Lifecycle Statuses (`status`)
| Status | Lifecycle Meaning | Next Transition |
|---|---|---|
| `UNDER_REVIEW` | Newly submitted; queued for investigation or human triage. | Moves to `IN_VERIFICATION` or `COMPLETED`. |
| `IN_VERIFICATION` | Automated fact-checking, search retrieval, or LLM reasoning actively in progress. | Moves to `COMPLETED` or reverts on failure. |
| `COMPLETED` | Verification finished; report, evidence cards, and verdict are available. | Final state (or subject to reviewer override). |
| `REJECTED` | Claim determined non-verifiable, spam, or out-of-scope. | Terminal state. |

---

## 5. Graceful Degradation & Offline Architecture

A key differentiator of ElectionVerify AI is its ability to continue functioning gracefully when external dependencies are unavailable:

1. **Backend Server Offline:** When the client fetch fails to reach `http://localhost:5000/api`, client service layers catch the network exception and return `{ isOffline: true }`. Frontends display non-intrusive warning banners (`OfflineNotice`) while allowing full exploration of demonstration claims and in-memory submissions.
2. **MongoDB Offline:** The backend server starts cleanly even if MongoDB is not running locally, outputting a clear startup warning and preventing fatal node crashes.
3. **AI Keys Absent:** If `GEMINI_API_KEY` and `OPENAI_API_KEY` are not configured, the backend automatically engages `UnconfiguredProvider`, issuing an explainable `INSUFFICIENT_EVIDENCE` finding and routing the claim to human review queues rather than hallucinating artificial verdicts.
