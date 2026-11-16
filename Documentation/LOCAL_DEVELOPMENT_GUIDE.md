# Local Development Guide — ElectionVerify AI

This guide provides clear, step-by-step instructions for running the **Shared-Backend**, **React-App**, and **NextJS-App** concurrently on a local workstation.

---

## 1. System Requirements

- **Node.js:** v18.x or v20.x+ (Node.js LTS recommended)
- **Package Manager:** `npm` (v9+)
- **Database:** MongoDB (Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
  *Note: The platform can run in demo mode even if MongoDB or external AI keys are offline.*
- **Git:** Version 2.30+

---

## 2. Port Allocation Overview

| Service | Technology | Default Local URL | Configuration Key |
|---|---|---|---|
| **Shared-Backend** | Express.js / Node.js | `http://localhost:5000` | `PORT=5000` |
| **React SPA** | Vite + React 19 | `http://localhost:5173` | `VITE_API_URL` |
| **Next.js App** | Next.js 15 (App Router) | `http://localhost:3000` | `NEXT_PUBLIC_API_URL` |

---

## 3. Environment Variable Setup

Each application maintains its own `.env` file configured from its respective `.env.example`:

### 3.1 Backend Configuration (`Shared-Backend/.env`)
Copy `Shared-Backend/.env.example` to `Shared-Backend/.env`:
```bash
cp Shared-Backend/.env.example Shared-Backend/.env
```
Key configuration settings in `Shared-Backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/electionverify
JWT_SECRET=your_jwt_secret_for_local_development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# AI Provider Configuration (Optional for local testing)
AI_PROVIDER=auto
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### 3.2 React SPA Configuration (`React-App/.env`)
Copy `React-App/.env.example` to `React-App/.env`:
```bash
cp React-App/.env.example React-App/.env
```
Contents:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.3 Next.js Configuration (`NextJS-App/.env.local`)
Copy `NextJS-App/.env.example` to `NextJS-App/.env.local`:
```bash
cp NextJS-App/.env.example NextJS-App/.env.local
```
Contents:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 4. Running the Applications

Open three terminal windows to run the applications concurrently:

### Terminal 1: Shared Backend
```bash
cd ElectionVerify-AI/Shared-Backend
npm install
npm run dev
# Starts backend server on http://localhost:5000
```

### Terminal 2: React SPA
```bash
cd ElectionVerify-AI/React-App
npm install
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### Terminal 3: Next.js App
```bash
cd ElectionVerify-AI/NextJS-App
npm install
npm run dev
# Starts Next.js server on http://localhost:3000
```

---

## 5. Verification & Testing

### 5.1 Run Backend Tests
The backend test suite validates all 17 integration rules:
```bash
cd ElectionVerify-AI/Shared-Backend
npm test
```

### 5.2 Build React SPA
```bash
cd ElectionVerify-AI/React-App
npm run build
```

### 5.3 Build Next.js App
```bash
cd ElectionVerify-AI/NextJS-App
npm run build
```

---

## 6. Common Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `[Database Warning] Server starting without active DB` | MongoDB is not running locally. | Start local MongoDB (`mongod` or Docker) or supply MongoDB Atlas URI in `.env`. Backend will still serve health and demo responses. |
| `CORS policy violation` | Frontend origin is missing in backend `CORS_ORIGIN`. | Ensure `http://localhost:5173,http://localhost:3000` is listed in `Shared-Backend/.env`. |
| `Backend API is currently offline` badge in UI | Backend server is stopped or port mismatch. | Confirm Shared-Backend is running on port 5000 and matches `VITE_API_URL` and `NEXT_PUBLIC_API_URL`. |
| Expired Token / 401 | JWT session expired. | Both frontends automatically purge expired tokens on 401; log in again via `/login`. |
