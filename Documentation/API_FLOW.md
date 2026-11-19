# API Flow & Contracts — ElectionVerify AI

This document specifies the unified REST API contracts, request payloads, response schemas, and interactive sequence flows used across **Shared-Backend**, **React-App**, and **NextJS-App**.

Base API Endpoint: `http://localhost:5000/api`

---

## 1. Global Response Standards

### 1.1 Success Schema
```json
{
  "success": true,
  "message": "Optional human-readable confirmation message",
  "data": { ... }
}
```

### 1.2 Error Schema
```json
{
  "success": false,
  "error": "Descriptive human-readable error summary",
  "details": [ "Detailed validation errors if applicable" ]
}
```

### 1.3 HTTP Status Code Mapping
- `200 OK`: Successful retrieval or synchronous update.
- `201 Created`: Resource successfully registered or created.
- `400 Bad Request`: Validation failure (malformed payload, missing fields).
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Authenticated user lacks required role or account is suspended.
- `404 Not Found`: Target resource identifier does not exist.
- `409 Conflict`: Resource unique constraint collision (e.g. duplicate email).
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Unexpected internal server exception.

---

## 2. Authentication API (`/api/auth`)

### 2.1 User Registration
- **Route:** `POST /api/auth/register`
- **Access:** Public (Rate limit: 20 req / 15 min)
- **Request Payload:**
```json
{
  "name": "Alex Morgan",
  "email": "alex.morgan@example.com",
  "password": "SecurePassword123!"
}
```
- **Validation Rules:**
  - `name`: String, 2–100 characters.
  - `email`: Valid RFC 5322 email string, automatically lowercased and trimmed.
  - `password`: Minimum 8 characters, containing uppercase, lowercase, and number.
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User account created successfully.",
  "data": {
    "user": {
      "id": "67364b0f488661858a7be834",
      "name": "Alex Morgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "accountStatus": "Active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 User Login
- **Route:** `POST /api/auth/login`
- **Access:** Public (Rate limit: 20 req / 15 min)
- **Request Payload:**
```json
{
  "email": "alex.morgan@example.com",
  "password": "SecurePassword123!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "user": {
      "id": "67364b0f488661858a7be834",
      "name": "Alex Morgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "accountStatus": "Active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 User Logout
- **Route:** `POST /api/auth/logout`
- **Access:** Public / Authenticated
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

### 2.4 Verify Current Session
- **Route:** `GET /api/auth/me`
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67364b0f488661858a7be834",
      "name": "Alex Morgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "accountStatus": "Active",
      "preferences": {
        "preferredLanguage": "English",
        "theme": "System",
        "notifications": {
          "emailNotifications": true,
          "resultNotifications": true,
          "announcementNotifications": false
        }
      }
    }
  }
}
```

---

## 3. User & Profile API (`/api/users`)

### 3.1 Get Profile
- **Route:** `GET /api/users/profile`
- **Access:** Authenticated
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "67364b0f488661858a7be834",
      "name": "Alex Morgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "accountStatus": "Active",
      "joinedDate": "2026-11-14T08:00:00.000Z",
      "preferences": { ... }
    }
  }
}
```

### 3.2 Update Personal Details
- **Route:** `PUT /api/users/profile`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "name": "Alexander Morgan",
  "email": "alexander.m@example.com"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "profile": { ... }
  }
}
```

### 3.3 Update User Preferences
- **Route:** `PUT /api/users/preferences`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "preferredLanguage": "Hindi",
  "theme": "Dark",
  "notifications": {
    "emailNotifications": true,
    "resultNotifications": true,
    "announcementNotifications": false
  }
}
```
- **Success Response (200 OK):** Returns `{ success: true, message: "Preferences updated successfully.", data: { preferences: { ... } } }`.

### 3.4 Update Password
- **Route:** `PUT /api/users/password`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewStrongPassword456!"
}
```
- **Success Response (200 OK):** Returns `{ success: true, message: "Password updated successfully." }`.

---

## 4. Claims API (`/api/claims`)

### 4.1 Submit Claim
- **Route:** `POST /api/claims`
- **Optional Query:** `?autoVerify=true` (Triggers asynchronous background verification)
- **Access:** Public or Authenticated (Rate limit: 30 req / 15 min)
- **Request Body:**
```json
{
  "claimText": "Voter registration in Precinct 7 was extended by 48 hours according to social media posts.",
  "sourceUrl": "https://example.com/posts/voter-reg-7",
  "language": "English",
  "context": "Circulating on messaging channels on Nov 14, 2026",
  "categoryTags": ["Voter Registration", "Precinct 7"]
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Claim submitted successfully for verification.",
  "data": {
    "claim": {
      "_id": "67364cf1488661858a7be842",
      "title": "Voter registration in Precinct 7 was extended by 48 hours according...",
      "claimText": "Voter registration in Precinct 7 was extended by 48 hours according to social media posts.",
      "sourceUrl": "https://example.com/posts/voter-reg-7",
      "language": "English",
      "context": "Circulating on messaging channels on Nov 14, 2026",
      "status": "UNDER_REVIEW",
      "verdictId": null,
      "categoryTags": ["Voter Registration", "Precinct 7"],
      "submittedDate": "2026-11-14T11:45:00.000Z"
    }
  }
}
```

### 4.2 Query Claims List
- **Route:** `GET /api/claims`
- **Access:** Public
- **Supported Query Parameters:**
  - `page`: Integer, defaults to 1.
  - `limit`: Integer, defaults to 10 (max 100).
  - `searchTerm`: String, case-insensitively searched across `title` and `claimText`.
  - `status`: String (`ALL` | `UNDER_REVIEW` | `IN_VERIFICATION` | `COMPLETED` | `REJECTED`).
  - `verdictId`: String (`ALL` | `SUPPORTED` | `CONTRADICTED` | `PARTIALLY_SUPPORTED` | `MISLEADING_CONTEXT` | `INSUFFICIENT_EVIDENCE`).
  - `language`: String (`ALL` | `English` | `Hindi` | `Telugu` | `Tamil` | ...).
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claims": [ ... ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 4.3 Aggregate Metrics
- **Route:** `GET /api/claims/stats`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalClaims": 45,
      "completedVerifications": 32,
      "underReview": 11,
      "inVerification": 1,
      "rejected": 1,
      "byVerdict": {
        "SUPPORTED": 14,
        "CONTRADICTED": 9,
        "PARTIALLY_SUPPORTED": 5,
        "MISLEADING_CONTEXT": 3,
        "INSUFFICIENT_EVIDENCE": 1
      }
    }
  }
}
```

### 4.4 Get Claim By ID
- **Route:** `GET /api/claims/:id`
- **Access:** Public
- **Success Response (200 OK):** Returns the claim document with fully populated `verificationReport`, `supportingEvidence`, `contradictingEvidence`, and `sources`.

---

## 5. Verification & Review API (`/api/verification`)

### 5.1 Trigger Pipeline
- **Route:** `POST /api/verification/claims/:id/verify`
- **Access:** Authenticated (Claim Submitter, Reviewer, or Admin)
- **Description:** Executes search retrieval via Tavily and semantic reasoning via Gemini. Uses in-flight deduplication to prevent duplicate concurrent runs.

### 5.2 Submit Human Expert Review
- **Route:** `POST /api/verification/claims/:id/review`
- **Access:** Role: `reviewer` or `admin`
- **Request Body:**
```json
{
  "decision": "REVISED",
  "verdictId": "CONTRADICTED",
  "notes": "Verified against the State Election Commission Gazette Notification No. SEC-2026/89. Official voter registration closed strictly on Nov 10, 2026."
}
```
- **Supported Decisions:**
  - `"APPROVED"`: Accepts original AI verdict without modification.
  - `"REVISED"`: Sets a new canonical verdict while strictly preserving `originalAiVerdictId`.
  - `"REQUIRES_FURTHER_INVESTIGATION"`: Flags claim as `UNDER_REVIEW` pending secondary evidence.
- **Success Response (200 OK):** Updates the claim's final verdict and attaches reviewer identity, decision, notes, and timestamp.

### 5.3 List Pending Reviews
- **Route:** `GET /api/verification/pending`
- **Access:** Role: `reviewer` or `admin`
- **Supported Query Parameters:**
  - `page`: Integer (defaults to 1)
  - `limit`: Integer (defaults to 20)
  - `reviewStatus`: String (`ALL` | `AWAITING_REVIEW` | `REQUIRES_FURTHER_INVESTIGATION`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claims": [ ... ],
    "pagination": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```
