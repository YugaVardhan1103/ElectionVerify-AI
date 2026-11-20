# ElectionVerify AI

### AI-Assisted Election Information Verification & Civic Integrity Platform

🌐 **Live Demo (React SPA):** [https://electionverify-react.vercel.app/](https://electionverify-react.vercel.app/)  
🌐 **Live Demo (Next.js App):** [https://electionverify-nai.vercel.app/](https://electionverify-nai.vercel.app/)

ElectionVerify AI is an AI-assisted platform designed to help voters, researchers, journalists, and civic advocates investigate election-related claims, examine supporting and contradicting evidence, and understand verification findings through transparent, explainable reports.

The platform combines artificial intelligence, authoritative evidence retrieval, and certified human expert oversight to make election-related claims transparent and verifiable.

> **Core Principle:** AI-assisted verification must remain transparent, evidence-based, and accountable. AI-generated conclusions must never replace primary election gazettes or independent human judgment. We strictly prohibit fabricated citations, synthetic confidence scores, and ungrounded verdicts.

---

## 🎯 Problem Statement & Objectives

Election-related misinformation, rumor cascades, and manipulated media can distort public understanding and erode democratic trust. Voters frequently encounter confusing, contradictory, or decontextualized claims without straightforward access to official election authority sources.

**ElectionVerify AI** solves this challenge through:
- **Democratized Claim Verification:** Enabling citizens and researchers to submit election claims and rumors for rigorous multi-source investigation.
- **Explainable Evidence Categorization:** Explicitly contrasting supporting vs. contradicting evidence from statutory election authorities, accredited fact-checkers, and reputable news media.
- **Responsible AI Safeguards:** Enforcing strict anti-hallucination protocols, transparent unconfigured notices, and certified human reviewer audit workflows.
- **Dual Independent Architectures:** Providing both a lightweight **React SPA** and an enterprise-grade **Next.js (App Router)** frontend connected to the same unified **Shared-Backend REST API**.

---

## 🚀 Key Features

### 1. React SPA (`React-App/`)
- High-performance, client-rendered single-page application built on Vite and React 19.
- Dynamic Bearer JWT authentication with automatic 401 token revocation and session restoration.
- Real-time Verification Dashboard with aggregate claim statistics and latest activity.
- Multilingual claim submission interface with client-side validation and **Image Proof / Evidence Upload** (drag & drop, up to 5 images, max 5 MB each, JPG/PNG/WEBP, previews & removal).
- Interactive Verification History with keyword search, canonical verdict filtering, and lifecycle status filtering.
- Deep-dive Verification Result views displaying verdict badges, claim metadata, user-submitted image proofs, supporting/contradicting evidence, and human review audit notes.
- Dedicated Reviewer Triage Queue displaying image proof count badges and preview thumbnails.
- Profile and preference manager with language selection and accessible Light/Dark theme toggle.
- Resilient offline fallback: seamlessly transitions to demonstration mode if the backend server is unreachable.

### 2. Next.js Application (`NextJS-App/`)
- Enterprise-grade hybrid frontend built on Next.js 15 (App Router), TypeScript, and Tailwind CSS.
- Server-side and client-side rendering with streaming layouts, custom loading skeletons, and accessible route boundaries.
- Equivalent core workflows matching the React SPA: Auth, Dashboard, Claim Submission with **Image Proof / Evidence Upload**, Verification History, and Profile Settings.
- Full TypeScript type safety across canonical verdicts, claim statuses, user profiles, image proofs, and evidence structures.
- Independent environment configuration (`NEXT_PUBLIC_API_URL`).

### 3. Shared Express.js Backend (`Shared-Backend/`)
- Modular Node.js / Express.js REST API with comprehensive input validation and centralized error handling.
- MongoDB persistence with Mongoose ODM, unique indexes, and compound text search indexes.
- **Secure Cloudinary Evidence Storage**: Authenticated `POST /api/claims/upload-evidence` with magic byte file signature verification, 5MB limit, and batch rollback; `DELETE /api/claims/:id/evidence/:publicId(*)` with strict ownership / reviewer authorization; automatic cascade deletion when claims are deleted.
- Stateless JWT authentication signed with HMAC-SHA256 and bcrypt password hashing (12 salt rounds).
- Stateless JWT authentication signed with HMAC-SHA256 and bcrypt password hashing (12 salt rounds).
- Role-Based Access Control (RBAC) supporting `user`, `reviewer`, and `admin` permissions.
- Pluggable Multi-Provider AI Architecture:
  - **Google Gemini Provider:** High-throughput semantic analysis and reasoning using Google Gemini.
  - **Tavily Evidence Search:** Multi-source external web search targeting statutory election authorities, gazettes, and fact-checking organizations.
  - **OpenAI Provider:** Structured JSON reasoning alternative.
  - **Unconfigured Provider:** Safe fallback that returns `INSUFFICIENT_EVIDENCE` with an administrative notice when API keys are absent, eliminating crashes and hallucinations.
- Serverless-Ready Verification Pipeline: Synchronous await with 12s timeout guard ensuring compatibility with Vercel serverless execution constraints.
- In-flight concurrency deduplication preventing duplicate API executions.
- Dual-Verdict & Reviewer Audit Trail preserving original AI output while recording human review decisions (`APPROVED`, `REVISED`, `REQUIRES_FURTHER_INVESTIGATION`).
- Built-in rate limiting (`express-rate-limit`) and Helmet security headers.

----

## 🏛️ System Architecture

```text
                             ElectionVerify AI
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────┐                       ┌───────────────────────────┐
│     React SPA (Vite)      │                       │     Next.js (App Router)  │
│     Port: 5173            │                       │     Port: 3000            │
└─────────────┬─────────────┘                       └─────────────┬─────────────┘
              │                                                   │
              └─────────────────────┬─────────────────────────────┘
                                    │ HTTP / JSON API (Bearer JWT)
                                    ▼
                      ┌───────────────────────────┐
                      │    Shared Express API     │
                      │    Port: 5000                 │
                      └─────────────┬─────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  MongoDB Database   │  │   AI Verification   │  │ Evidence Retrieval  │
│  Users, Claims,     │  │   Gemini, OpenAI,   │  │ Google Search /     │
│  Reports, Evidence  │  │   Unconfigured      │  │ Domain Trust Engine │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **React SPA** | React 19, Vite, React Router DOM 7, Tailwind CSS v4 |
| **Next.js App** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend API** | Node.js (ESM), Express.js 4, Mongoose ODM |
| **Database** | MongoDB (Local instance or MongoDB Atlas) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs, Secure Client Storage |
| **Security** | Helmet, CORS origin whitelisting, Express Rate Limit |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash`), OpenAI API (`gpt-4o-mini`) |
| **Evidence Retrieval** | Google Custom Search API, Domain Trust Classifier |
| **Testing** | Node.js Native Test Runner (`node --test`), ESLint |

---

## 📁 Repository Structure

```text
ElectionVerify-AI/
├── .gitignore                      # Root Git ignore rules (node_modules, .env, build outputs)
├── README.md                       # Master platform guide & documentation
│
├── Documentation/                  # Comprehensive engineering & civic documentation
│   ├── README.md                   # Documentation directory index
│   ├── ARCHITECTURE.md             # System design, session security, & fallback model
│   ├── API_FLOW.md                 # REST API specification, request/response contracts
│   ├── DATABASE_STRUCTURE.md       # MongoDB schemas, indexes, and data dictionary
│   ├── AI_VERIFICATION_WORKFLOW.md # Pipeline mechanics, prompt design, & provider adapters
│   ├── RESPONSIBLE_AI_SAFEGUARDS.md# Ethics, anti-hallucination, & human-in-the-loop rules
│   └── LOCAL_DEVELOPMENT_GUIDE.md  # Step-by-step local execution instructions
│
├── Shared-Backend/                 # Shared Node.js / Express REST API
│   ├── .env.example                # Backend environment configuration template
│   ├── .gitignore                  # Backend-specific ignore rules
│   ├── package.json                # Express, Mongoose, JWT, bcrypt dependencies
│   ├── src/
│   │   ├── app.js                  # Express middleware setup, CORS, rate limiting
│   │   ├── server.js               # Database connection & HTTP server bootstrap
│   │   ├── config/                 # Environment variables, database, canonical constants
│   │   ├── controllers/            # Auth, User, Claim, & Verification controllers
│   │   ├── middleware/             # requireAuth, requireRole, errorHandler, validate
│   │   ├── models/                 # User, Claim, VerificationReport, EvidenceSource
│   │   ├── routes/                 # Express route handlers (/auth, /users, /claims, /verification)
│   │   └── services/               # AuthService, ClaimService, VerificationService, AI adapters
│   └── tests/                      # Automated test suite (17 passing integration tests)
│
├── React-App/                      # Independent React Single-Page Application
│   ├── .env.example                # React environment template (VITE_API_URL)
│   ├── .gitignore                  # React build & node_modules ignore rules
│   ├── package.json                # React 19, Vite, Tailwind CSS dependencies
│   ├── vite.config.js              # Vite bundler configuration
│   └── src/
│       ├── components/             # Reusable UI (Navbar, Card, Button, StatusBadge, OfflineNotice)
│       ├── constants/              # Canonical verdicts definitions
│       ├── context/                # AuthContext (JWT session state), ThemeContext
│       ├── pages/                  # Home, Login, Signup, Dashboard, SubmitClaim, Results, History, Profile
│       ├── services/               # REST API client (api.js), authService, claimService, profileService
│       └── utils/                  # Input validation utilities
│
└── NextJS-App/                     # Independent Next.js 15 Fullstack Application
    ├── .env.example                # Next.js environment template (NEXT_PUBLIC_API_URL)
    ├── .gitignore                  # Next.js build (.next) & node_modules ignore rules
    ├── package.json                # Next.js 15, React 19, TypeScript dependencies
    ├── app/                        # App Router pages (auth, dashboard, claims, history, profile)
    ├── components/                 # Reusable React components & StatusBadge
    ├── constants/                  # Canonical verdict definitions
    ├── context/                    # AuthContext & ThemeContext
    ├── lib/                        # Type-safe API client (api.ts), validators, mockData
    └── types/                      # TypeScript definitions (ClaimItem, VerificationReportData, etc.)
```

---

## ⚖️ Canonical Verdicts & Status Standard

To prevent semantic divergence, all three projects share identical verification taxonomy:

### Canonical Verification Verdicts (`verdictId`)
1. **`SUPPORTED`** — *Supported by Evidence*: Reliable evidence directly supports the core claims made in the statement.
2. **`CONTRADICTED`** — *Contradicted by Evidence*: Reliable evidence directly contradicts the core claims made in the statement.
3. **`PARTIALLY_SUPPORTED`** — *Partially Supported*: The statement contains elements of truth, but some claims are unverified, exaggerated, or inaccurate.
4. **`MISLEADING_CONTEXT`** — *Misleading Context*: The information is factually real but presented without critical context, creating a false impression.
5. **`INSUFFICIENT_EVIDENCE`** — *Insufficient Evidence*: Available reliable evidence is insufficient to confirm or refute the claim definitively.

### Claim Processing Statuses (`status`)
1. **`UNDER_REVIEW`** — Submitted and awaiting processing or human expert triage.
2. **`IN_VERIFICATION`** — Automated fact-checking and evidence retrieval pipeline active.
3. **`COMPLETED`** — Verification complete; detailed report and verdict are available.
4. **`REJECTED`** — Claim determined non-verifiable, spam, or out-of-scope.

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js** (v18.x or v20.x LTS)
- **npm** (v9+)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/YugaVardhan1103/ElectionVerify-AI.git
cd ElectionVerify-AI
```

### 2. Configure Environment Variables
Copy `.env.example` templates to active environment files:

```bash
# 1. Backend configuration
cp Shared-Backend/.env.example Shared-Backend/.env

# 2. React SPA configuration
cp React-App/.env.example React-App/.env

# 3. Next.js configuration
cp NextJS-App/.env.example NextJS-App/.env.local
```

### 3. Start Shared-Backend (Terminal 1)
```bash
cd Shared-Backend
npm install
npm run dev
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/health
```

### 4. Start React SPA (Terminal 2)
```bash
cd React-App
npm install
npm run dev
# Application starts at http://localhost:5173
```

### 5. Start Next.js App (Terminal 3)
```bash
cd NextJS-App
npm install
npm run dev
# Application starts at http://localhost:3000
```

---

## 🧪 Testing & Quality Checks

Run the essential quality checks across all services:

```bash
# Run Shared-Backend integration tests
npm --prefix Shared-Backend test

# Build React SPA for production
npm --prefix React-App run build

# Build Next.js App for production
npm --prefix NextJS-App run build
```

---

## 🚀 Deployment Instructions

### Frontend Deployment (Vercel)
Both frontends can be deployed to Vercel as independent projects:
1. **React SPA:**
   - Root Directory: `React-App`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-domain.com/api`
2. **Next.js App:**
   - Root Directory: `NextJS-App`
   - Framework Preset: `Next.js`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`

### Backend Deployment (Render / Railway)
1. Deploy `Shared-Backend` as a Web Service.
2. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<strong-256-bit-secret>`
   - `CORS_ORIGIN=https://your-react-domain.vercel.app,https://your-nextjs-domain.vercel.app`
   - `AI_PROVIDER=auto` (or `gemini`)
   - `GEMINI_API_KEY=<your-google-ai-studio-key>`

---

## 🔐 Responsible AI & Civic Integrity

ElectionVerify AI adheres to strict civic integrity principles:
- **No Fabricated Citations:** Evidence sources are never hallucinated. When no reliable sources exist, sources are honestly left empty.
- **No Synthetic Confidence Percentages:** The platform avoids misleading numerical percentages (e.g. "86% true") in favor of categorical verdicts.
- **Statutory Authority Precedence:** The system makes clear that only official statutory election bodies issue legally binding rulings.
- **Human Oversight:** Reviewers and administrators have the tools to audit and override automated verdicts with gazette citations.

For full details, read [RESPONSIBLE_AI_SAFEGUARDS.md](./Documentation/RESPONSIBLE_AI_SAFEGUARDS.md).

---

## 👨‍💻 Author

**Yuga Vardhan**
- GitHub: [@YugaVardhan1103](https://github.com/YugaVardhan1103)
- Repository: [ElectionVerify AI](https://github.com/YugaVardhan1103/ElectionVerify-AI)

---

*ElectionVerify AI — Fostering trust, accountability, and evidence in digital civic discourse.*
