# ElectionVerify AI — React Frontend Application

ElectionVerify AI is an evidence-driven, transparent platform prototype designed to verify election-related claims, analyze facts against credible sources, and provide accountable verification reports with human oversight.

This package (`React-App/`) contains the single-page application (SPA) client built with React, Vite, Tailwind CSS, and React Router DOM.

---

## 🚀 Key Features Implemented

### 1. Canonical Five-Verdict Verification Framework
The platform strictly enforces five official verification verdicts defined in `src/constants/verdicts.js`:
- **Supported by Evidence** (`SUPPORTED`): Reliable evidence directly supports the core claims.
- **Contradicted by Evidence** (`CONTRADICTED`): Reliable evidence directly contradicts the core claims.
- **Partially Supported** (`PARTIALLY_SUPPORTED`): Elements of truth exist, but aspects are unverified or exaggerated.
- **Misleading Context** (`MISLEADING_CONTEXT`): Statement is factually real but presented without critical context.
- **Insufficient Evidence** (`INSUFFICIENT_EVIDENCE`): Available evidence is inadequate for definitive confirmation or refutation.

*Note: Claim lifecycle states such as `UNDER_REVIEW` and `COMPLETED` are maintained strictly separate from verification verdicts.*

### 2. Client-Side Demo Services
Decoupled in-memory services model realistic business operations without external backends:
- **`authService.js`**: Simulated login, signup, and logout with zero password storage. All operations explicitly flag `isDemo: true`.
- **`claimService.js`**: In-memory claim submission with collision-resistant IDs (`crypto.randomUUID()`), search and multi-criteria filtering, aggregate metrics derivation, and verification report retrieval.
- **`profileService.js`**: Personal information updates, preference synchronization, and client-validated password update simulation.

### 3. Application Security & Route Protection
- **`AuthContext.jsx` & `useAuth.js`**: Reactive session state provider wrapping `authService.js`.
- **`ProtectedRoute.jsx`**: Shields private routes (`/dashboard`, `/submit-claim`, `/verification-result`, `/verification-history`, `/profile`), redirecting unauthenticated users to `/login`.

### 4. Dual-Mode Theme System
- Supports **Light**, **Dark**, and **System** visual themes.
- Powered by `ThemeContext.jsx` with real-time `prefers-color-scheme` listeners.
- Includes pre-hydration script in `index.html` to eliminate Flash of Unstyled Content (FOUC).
- Synchronized with user profile preferences.

### 5. Centralized Form Validation
Centralized in `src/utils/validators.js`:
- Required string validation
- Internationalized email validation (`validateEmail`)
- Password strength validation (8+ chars, uppercase, lowercase, numeric)
- Password confirmation matching
- Safe URL validation (`validateUrl`, http/https only)
- Unicode-aware name validation (`validateName`, supporting global scripts and combining marks)

### 6. Interactive Pages & Workflows
- **Home (`/`)**: Hero, 3-step verification workflow, platform capabilities, and transparency principles.
- **Login (`/login`) & Signup (`/signup`)**: Clean authentication forms with live validation and demo notices.
- **Forgot Password (`/forgot-password`)**: Demonstrates simulated recovery without deceptive "email sent" claims.
- **Dashboard (`/dashboard`)**: Metric overview cards, quick actions, and recent activity feed.
- **Submit Claim (`/submit-claim`)**: Multi-field submission supporting international election languages, optional sources, and background context.
- **Verification History (`/verification-history`)**: Searchable, filterable audit trail of verified claims and pending reviews.
- **Verification Result (`/verification-result/:id`)**: Detailed verification report displaying verdict badge, claim summary, evidence cards, AI limitations notice, and statutory caveats. Distinctly handles the `UNDER_REVIEW` processing state without fabricating verdicts.
- **Profile (`/profile`)**: Dynamic initials avatar, personal info editing, simulated password update, notification toggles, language, and theme controls.
- **Not Found (`*`)**: Responsive 404 page with return navigation.

---

## 🔒 Ethical & Demonstration Safeguards

- **No Credential Storage**: Passwords are never saved to `localStorage`, `sessionStorage`, or in-memory profiles.
- **Zero Fabricated Citations**: Sources lists are strictly empty (`sources: []`) until real backend retrieval pipelines are integrated.
- **No Deceptive Metrics**: Fabricated confidence percentage bars have been eliminated.
- **Clear Demonstration Banners**: Prominent indicators remind users that findings represent UI preview fixtures.

---

## 🛠️ Project Structure

```
React-App/
├── index.html                  # HTML entry point with FOUC prevention script
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                # App bootstrap with ThemeProvider & AuthProvider
│   ├── App.jsx                 # Routing configuration & ProtectedRoute wrappers
│   ├── index.css               # Design tokens, color system, and global focus rings
│   ├── components/
│   │   ├── Button.jsx          # Reusable button with variants, sizes & loading states
│   │   ├── Card.jsx            # Reusable card with semantic tags and padding
│   │   ├── FormInput.jsx       # Accessible form input with ARIA & error linkages
│   │   ├── Navbar.jsx          # Auth-aware responsive navigation with theme toggle
│   │   └── ProtectedRoute.jsx  # Route protection guard
│   ├── constants/
│   │   └── verdicts.js         # Canonical 5 verdicts with theme-aware badge classes
│   ├── context/
│   │   ├── AuthContext.js      # Auth context declaration & useAuth hook
│   │   ├── AuthContext.jsx     # AuthProvider implementation
│   │   ├── useAuth.js          # useAuth convenience export
│   │   ├── ThemeContext.js     # Theme context declaration & normalizeTheme helper
│   │   ├── ThemeContext.jsx    # ThemeProvider with matchMedia listener
│   │   └── useTheme.js         # useTheme convenience export
│   ├── data/
│   │   └── mockData.js         # Deeply frozen baseline demonstration records
│   ├── services/
│   │   ├── authService.js      # In-memory authentication service
│   │   ├── claimService.js     # In-memory claim submission and query service
│   │   └── profileService.js   # In-memory profile and preferences service
│   ├── utils/
│   │   └── validators.js       # Pure client-side validation functions
│   └── pages/
│       ├── Home.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── ForgotPassword.jsx
│       ├── Dashboard.jsx
│       ├── SubmitClaim.jsx
│       ├── VerificationResult.jsx
│       ├── VerificationHistory.jsx
│       ├── Profile.jsx
│       └── NotFound.jsx
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
```bash
cd React-App
npm install
```

### Development Server
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Production Build
Compile and bundle optimized assets for deployment:
```bash
npm run build
```

### Code Quality & Linting
Run ESLint across all JavaScript and JSX source files:
```bash
npm run lint
```
