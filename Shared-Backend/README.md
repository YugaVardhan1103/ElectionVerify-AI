# ElectionVerify AI — Shared Backend REST API

This repository contains the official shared backend service for **ElectionVerify AI**, providing a scalable Node.js + Express REST API backed by MongoDB. It powers both the React SPA client and the Next.js client with unified authentication, claim persistence, evidence retrieval, AI verification pipelines, and human reviewer workflows.

---

## 🚀 Key Architectural Features

### 1. Canonical Five-Verdict Verification Framework
The backend strictly enforces the five official platform verdicts defined in `src/config/constants.js`:
- `SUPPORTED`: Reliable evidence directly supports the core claim.
- `CONTRADICTED`: Reliable evidence directly contradicts the core claim.
- `PARTIALLY_SUPPORTED`: Claim contains elements of truth with unverified or exaggerated details.
- `MISLEADING_CONTEXT`: Factually accurate but presented without essential context.
- `INSUFFICIENT_EVIDENCE`: Available reliable evidence is inadequate for definitive confirmation.

Claim processing lifecycle states (`UNDER_REVIEW`, `IN_VERIFICATION`, `COMPLETED`, `REJECTED`) are strictly separated from verification verdicts.

### 2. Configurable AI Verification Adapters
Built using the Provider Adapter Pattern under `src/services/ai/`:
- **Google Gemini Provider** (`geminiProvider.js`): Uses Google Generative Language API with low-temperature structured JSON schema.
- **OpenAI Provider** (`openaiProvider.js`): Uses OpenAI chat completions with structured JSON response format.
- **Unconfigured Provider** (`unconfiguredProvider.js`): If external API keys are unavailable, the backend gracefully defaults to `INSUFFICIENT_EVIDENCE` with a transparent explanation, scheduling the claim for human review. It **never fabricates verification findings, evidence, or citations**.

### 3. Evidence Retrieval Service
- Integrates with Google Custom Search API (`evidenceRetrievalService.js`) to discover published documents and public notices.
- Categorizes domain authority into institutional tiers (*Statutory Election Body*, *Recognized News Media*, *Fact-Checking Organization*).
- When unconfigured, records empty citations (`sources: []`) rather than inventing synthetic sources.

### 4. Human-in-the-Loop Expert Review
- Claims lacking sufficient evidence or flagged during automated screening are placed in a dedicated review queue (`GET /api/verification/pending`).
- Certified reviewers and administrators can inspect claims, attach explanatory notes, and apply definitive verdict decisions (`POST /api/verification/claims/:id/review`).

### 5. Robust Security & Middleware Stack
- **Password Security**: Salted hashing with `bcryptjs` (10 rounds); passwords never stored in plaintext and excluded from default queries via Mongoose `select: false`.
- **JWT Authentication**: Stateless token generation with configurable expiration and secure signature verification.
- **Role-Based Authorization**: Distinct access levels (`user`, `reviewer`, `admin`).
- **HTTP Security**: `helmet` headers, cross-origin resource sharing (`cors`), and `express-rate-limit` guards against brute-force attacks.
- **Centralized Error Handling**: Uniform error responses across all endpoints (`{ success: false, error: "..." }`).

---

## 📂 Project Structure

```
Shared-Backend/
├── .env.example                # Example environment configuration
├── package.json
├── README.md                   # Backend documentation
├── API_DOCUMENTATION.md        # Full REST API endpoint specification
├── src/
│   ├── server.js               # Application entry point & graceful shutdown
│   ├── app.js                  # Express middleware setup & router mounting
│   ├── config/
│   │   ├── constants.js        # Canonical verdicts, statuses, roles, languages
│   │   ├── environment.js      # Environment variable validation with defaults
│   │   └── db.js               # MongoDB connection logic via Mongoose
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt pre-save hook & JWT methods
│   │   ├── Claim.js            # Claim schema with text index & lifecycle statuses
│   │   ├── VerificationReport.js # Detailed report with evidence cards & AI metadata
│   │   └── EvidenceSource.js   # Cited sources with domain trust classifications
│   ├── middleware/
│   │   ├── auth.js             # requireAuth, optionalAuth, requireRole guards
│   │   ├── rateLimiter.js      # General API, auth, and submission rate limiters
│   │   ├── validate.js         # Input validation helpers
│   │   └── errorHandler.js     # Centralized error handler & 404 handler
│   ├── services/
│   │   ├── authService.js      # User registration, login, profile, password management
│   │   ├── claimService.js     # Claim persistence, multi-criteria filtering, stats
│   │   ├── verificationService.js # End-to-end verification pipeline & human review
│   │   ├── evidenceRetrievalService.js # Authoritative evidence retrieval
│   │   └── ai/
│   │       ├── baseAiProvider.js       # Abstract AI provider interface
│   │       ├── aiProviderFactory.js    # Dynamic provider resolution
│   │       ├── geminiProvider.js       # Google Gemini API adapter
│   │       ├── openaiProvider.js       # OpenAI API adapter
│   │       └── unconfiguredProvider.js # Transparent missing-credentials fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, login, logout, getMe
│   │   ├── userController.js   # Profile & preferences management
│   │   ├── claimController.js  # Claim submission & listing
│   │   └── verificationController.js # Verification pipeline trigger & review
│   └── routes/
│       ├── authRoutes.js       # /api/auth
│       ├── userRoutes.js       # /api/users
│       ├── claimRoutes.js      # /api/claims
│       ├── verificationRoutes.js # /api/verification
│       └── index.js            # Route aggregator & health check
└── tests/
    └── backend.test.js         # Node.js native test suite
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB community server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string

### 1. Installation
```bash
cd Shared-Backend
npm install
```

### 2. Environment Configuration
Copy the `.env.example` template:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB URI, JWT secret, and optional AI provider credentials:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/electionverify
JWT_SECRET=your_secure_random_jwt_secret_key_here
AI_PROVIDER=auto
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Running the Server

**Development Mode (auto-reload with Node `--watch`):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 4. Running the Test Suite
The backend includes a comprehensive test suite using Node's native test runner (`node --test`):
```bash
npm test
```

---

## 🔒 Security & Data Integrity Guarantees

1. **No Plaintext Passwords**: Passwords pass through salted bcrypt hashing before database writes.
2. **No Fabricated Data**: If external AI or search credentials are missing, the system explicitly reports that configuration is required and sets the verdict to `INSUFFICIENT_EVIDENCE`.
3. **Audit Trail**: Verification reports store full execution metadata (provider, model, token usage, timestamps, reviewer identity).
4. **Rate Limiting**: Defends authentication endpoints from credential-stuffing attacks.
