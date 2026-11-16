# ElectionVerify AI — Shared Backend REST API Reference

Base URL: `http://localhost:5000/api`

All endpoints accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 📋 Response Format Standard

### Success Response
```json
{
  "success": true,
  "message": "Human-friendly success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description message",
  "details": [ ... ]
}
```

---

## 🏛️ Verification System Constants

### Canonical Verdicts (`verdictId`)
1. `SUPPORTED` — Reliable evidence directly supports the core claims made in the statement.
2. `CONTRADICTED` — Reliable evidence directly contradicts the core claims made in the statement.
3. `PARTIALLY_SUPPORTED` — The statement contains elements of truth, but some claims are unverified, exaggerated, or inaccurate.
4. `MISLEADING_CONTEXT` — The information is factually real but presented without critical context, creating a false impression.
5. `INSUFFICIENT_EVIDENCE` — Available reliable evidence is insufficient to confirm or refute the claim definitively.

### Claim Processing Statuses (`status`)
1. `UNDER_REVIEW` — Submitted and awaiting processing or human expert triage.
2. `IN_VERIFICATION` — Automated fact-checking and evidence retrieval pipeline active.
3. `COMPLETED` — Verification complete; detailed report and verdict are available.
4. `REJECTED` — Claim is non-verifiable, spam, or out of scope.

---

## 🔑 Authentication Endpoints (`/api/auth`)

### 1. Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Access:** Public (Rate limited: 20 req/15min)
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password123"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "User account created successfully.",
  "data": {
    "user": {
      "id": "67364b0f...",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "user",
      "accountStatus": "Active"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### 2. Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Access:** Public (Rate limited: 20 req/15min)
- **Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "password": "Password123"
}
```
- **Response:** `200 OK` (returns user profile and JWT token)

### 3. Logout User
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Access:** Public / Authenticated

### 4. Get Current User Session
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Access:** Authenticated (`Bearer <token>`)
- **Response:** `200 OK`

---

## 👤 Profile & User Endpoints (`/api/users`)

### 1. Get Profile
- **Method:** `GET`
- **URL:** `/api/users/profile`
- **Access:** Authenticated

### 2. Update Personal Details
- **Method:** `PUT`
- **URL:** `/api/users/profile`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

### 3. Update Preferences
- **Method:** `PUT`
- **URL:** `/api/users/preferences`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "preferredLanguage": "Hindi",
  "theme": "Dark",
  "notifications": {
    "emailNotifications": true,
    "resultNotifications": true,
    "announcementNotifications": true
  }
}
```

### 4. Update Password
- **Method:** `PUT`
- **URL:** `/api/users/password`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewStrongPassword456"
}
```

### 5. List Users (Admin only)
- **Method:** `GET`
- **URL:** `/api/users?page=1&limit=20`
- **Access:** Role: `admin`

---

## 📝 Claim Endpoints (`/api/claims`)

### 1. Submit Claim
- **Method:** `POST`
- **URL:** `/api/claims` (optional query: `?autoVerify=true`)
- **Access:** Public or Authenticated (Rate limited: 30 req/15min)
- **Request Body:**
```json
{
  "claimText": "Voting machines were replaced in District 14 without notice.",
  "sourceUrl": "https://example.com/post/123",
  "language": "English",
  "context": "Circulating on social messaging channels on Nov 14, 2026",
  "categoryTags": ["EVM", "District 14"]
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Claim submitted successfully for verification.",
  "data": {
    "claim": {
      "_id": "67364cf1...",
      "title": "Voting machines were replaced in District 14 without notice...",
      "claimText": "Voting machines were replaced in District 14 without notice.",
      "status": "UNDER_REVIEW",
      "verdictId": null,
      "submittedDate": "2026-11-14T11:45:00.000Z"
    }
  }
}
```

### 2. List Claims with Filtering & Search
- **Method:** `GET`
- **URL:** `/api/claims`
- **Access:** Public
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `searchTerm` (string, matches title and claim statement)
  - `status` (`ALL` | `UNDER_REVIEW` | `IN_VERIFICATION` | `COMPLETED` | `REJECTED`)
  - `verdictId` (`ALL` | `SUPPORTED` | `CONTRADICTED` | `PARTIALLY_SUPPORTED` | `MISLEADING_CONTEXT` | `INSUFFICIENT_EVIDENCE`)
  - `language` (`ALL` | `English` | `Hindi` | `Telugu` | ...)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "claims": [ ... ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Get Claim Statistics
- **Method:** `GET`
- **URL:** `/api/claims/stats`
- **Access:** Public
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalClaims": 42,
      "completedVerifications": 30,
      "underReview": 10,
      "inVerification": 1,
      "rejected": 1,
      "byVerdict": {
        "SUPPORTED": 14,
        "CONTRADICTED": 8,
        "PARTIALLY_SUPPORTED": 5,
        "MISLEADING_CONTEXT": 2,
        "INSUFFICIENT_EVIDENCE": 1
      }
    }
  }
}
```

### 4. Get Claim Details by ID
- **Method:** `GET`
- **URL:** `/api/claims/:id`
- **Access:** Public
- **Response:** `200 OK` (returns claim with populated `verificationReport`, supporting/contradicting evidence, and cited sources)

---

## 🔍 Verification & Review Endpoints (`/api/verification`)

### 1. Trigger Verification Pipeline
- **Method:** `POST`
- **URL:** `/api/verification/claims/:id/verify`
- **Access:** Roles: `reviewer`, `admin`
- **Description:** Initiates automated evidence search, calls the configured AI provider, generates an explainable report, and saves findings. If AI credentials are not configured, generates an `INSUFFICIENT_EVIDENCE` notice and queues the claim for human review.

### 2. Submit Human Expert Review
- **Method:** `POST`
- **URL:** `/api/verification/claims/:id/review`
- **Access:** Roles: `reviewer`, `admin`
- **Request Body:**
```json
{
  "verdictId": "CONTRADICTED",
  "notes": "Verified against the Official State Election Gazette notification issued on Nov 12, 2026. The circulating document uses an outdated ballot template.",
  "isApproved": true
}
```
- **Response:** `200 OK`

### 3. List Claims Pending Human Review
- **Method:** `GET`
- **URL:** `/api/verification/pending?page=1&limit=20`
- **Access:** Roles: `reviewer`, `admin`

---

## ⚙️ System Endpoints

- `GET /health` — Root health check endpoint (`{ success: true, status: "ok" }`).
- `GET /api/health` — API health check endpoint.
- `GET /api/meta` — Canonical verdicts and claim statuses metadata.
