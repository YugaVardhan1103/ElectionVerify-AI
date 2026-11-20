# ElectionVerify AI — Next.js Frontend Application

An independent, modern frontend for **ElectionVerify AI** built with the Next.js App Router, React 19, TypeScript, and Tailwind CSS. It provides an accessible, evidence-grounded civic interface to investigate election claims, examine supporting and contradicting evidence, and review findings.

---

## 🚀 Key Features Implemented

### 1. Next.js App Router Architecture
- **Server Components by Default**: Pages like Home (`/`) and dynamic claim reports (`/verification-result/[id]`) leverage Server Components for fast initial loads, SEO optimization, and streamable content.
- **Client Components**: Interactive forms, stateful dashboards, theme switching, and client session guards are designated with `"use client"`.
- **Nested & Dynamic Routing**: Dynamic claim reports live at `/verification-result/[id]`, supporting clean URL parameters and graceful not-found states.
- **Loading & Error Boundaries**: Implemented `loading.tsx` skeletons and `error.tsx` error boundaries across roots and nested route groups.

### 2. Canonical Five-Verdict Framework
Enforces the platform's official verification outcomes defined in `constants/verdicts.ts`:
- `SUPPORTED`: Reliable evidence directly supports the core claims.
- `CONTRADICTED`: Reliable evidence directly contradicts the core claims.
- `PARTIALLY_SUPPORTED`: Contains truth, but details are unverified or exaggerated.
- `MISLEADING_CONTEXT`: Factually accurate but presented without necessary context.
- `INSUFFICIENT_EVIDENCE`: Available evidence is inadequate for definitive confirmation.

Claim processing lifecycle states (`UNDER_REVIEW`, `IN_VERIFICATION`, `COMPLETED`, `REJECTED`) are strictly separated from verdicts.

### 3. Shared-Backend REST API Integration
- Connects directly to the `Shared-Backend` REST API via environment variable `API_URL` (or legacy `NEXT_PUBLIC_API_URL`, defaults to `http://localhost:5000/api`).
- **Resilient Fallback Handling**: If the backend service is offline or unreachable, the client handles errors gracefully with session persistence.
- **Zero Hallucination Guarantee**: The client never fabricates artificial evidence, synthetic citations, or fake confidence percentages.

### 4. Comprehensive Page Workflows
- **Home (`/`)**: Hero section, 3-step verification explanation, platform principles, and accessible footer.
- **Login (`/login`) & Signup (`/signup`)**: Clean authentication flows with live client validation (`validators.ts`) and API token management.
- **Forgot Password (`/forgot-password`)**: Recovery interface with transparent notices regarding email delivery.
- **Dashboard (`/dashboard`)**: Metric overview cards, quick submission action, and recent activity log.
- **Submit Claim (`/submit-claim`)**: Multi-field submission supporting international election languages, optional source URLs, and context notes.
- **Verification History (`/verification-history`)**: Search bar, status dropdown, verdict dropdown, and pagination.
- **Verification Result (`/verification-result/[id]`)**: Full report layout displaying verdict badge, claim summary, supporting/contradicting evidence cards, human review notes, and statutory caveats. Distinctly handles `UNDER_REVIEW` states.
- **Profile (`/profile`)**: Dynamic initials avatar, personal details editing, simulated password update, notification toggles, and theme controls.

### 5. Dual-Mode Theme System
- Supports **Light**, **Dark**, and **System** visual themes.
- Powered by `ThemeContext.tsx` with real-time `prefers-color-scheme` listeners and pre-hydration script in `layout.tsx` to prevent FOUC.

---

## 📂 Project Structure

```
NextJS-App/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider, AuthProvider, Navbar
│   ├── page.tsx                # Home page (Server Component)
│   ├── loading.tsx             # Root loading indicator
│   ├── error.tsx               # Root error boundary ('use client')
│   ├── not-found.tsx           # Global 404 page
│   ├── globals.css             # Tailwind directives & CSS custom properties
│   ├── (auth)/
│   │   ├── login/page.tsx      # Sign In page ('use client')
│   │   ├── signup/page.tsx     # Sign Up page ('use client')
│   │   └── forgot-password/page.tsx # Password recovery ('use client')
│   ├── dashboard/
│   │   ├── page.tsx            # Protected dashboard ('use client')
│   │   └── loading.tsx         # Dashboard loading skeleton
│   ├── submit-claim/
│   │   └── page.tsx            # Submit claim form ('use client')
│   ├── verification-history/
│   │   └── page.tsx            # Filterable verification history ('use client')
│   ├── verification-result/
│   │   ├── page.tsx            # Redirects to history
│   │   └── [id]/
│   │       ├── page.tsx        # Dynamic claim report (Server Component)
│   │       ├── loading.tsx     # Report loading skeleton
│   │       └── not-found.tsx   # Claim not found page
│   └── profile/
│       └── page.tsx            # User profile & preferences ('use client')
├── components/
│   ├── Button.tsx              # Reusable button with variants & loading state
│   ├── Card.tsx                # Reusable card with semantic tag support
│   ├── FormInput.tsx           # Accessible form input with ARIA & error linkages
│   ├── Navbar.tsx              # Responsive navigation header with theme toggle
│   ├── VerdictBadge.tsx        # Canonical verdict badge renderer
│   ├── StatusBadge.tsx         # Processing status badge renderer
│   ├── ProtectedRoute.tsx      # Client-side authentication route guard
│   └── OfflineNotice.tsx       # Offline / demo mode banner
├── constants/
│   └── verdicts.ts             # 5 canonical verdicts & language list
├── context/
│   ├── ThemeContext.tsx        # Theme provider (Light, Dark, System)
│   └── AuthContext.tsx         # Authentication state provider
├── lib/
│   ├── api.ts                  # REST API client with offline fallback
│   ├── validators.ts           # Pure client-side validation utilities
│   └── mockData.ts             # Baseline demonstration fixtures
├── types/
│   └── index.ts                # TypeScript interfaces
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Installation
```bash
cd NextJS-App
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set `API_URL` (or `NEXT_PUBLIC_API_URL`) to your backend instance (defaults to `http://localhost:5000/api`).

### 3. Development Server
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
Compile and bundle the production application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```
