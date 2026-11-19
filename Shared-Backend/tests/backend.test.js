
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import { disconnectDB } from "../src/config/db.js";
import app from "../src/app.js";

import {
  VERDICTS,
  CANONICAL_VERDICT_IDS,
  CLAIM_STATUS,
  CLAIM_STATUS_LIST,
  USER_ROLES,
} from "../src/config/constants.js";

import { getAiProvider } from "../src/services/ai/aiProviderFactory.js";
import { UnconfiguredProvider } from "../src/services/ai/unconfiguredProvider.js";

import {
  EvidenceRetrievalService,
} from "../src/services/evidenceRetrievalService.js";


describe("1. Canonical Verification & Lifecycle Constants", () => {
  it("should define exactly the 5 canonical verdicts", () => {
    assert.equal(CANONICAL_VERDICT_IDS.length, 5);

    assert.deepEqual(
      [...CANONICAL_VERDICT_IDS].sort(),
      [
        "CONTRADICTED",
        "INSUFFICIENT_EVIDENCE",
        "MISLEADING_CONTEXT",
        "PARTIALLY_SUPPORTED",
        "SUPPORTED",
      ].sort()
    );
  });

  it("should verify verdict metadata has label and description", () => {
    for (const id of CANONICAL_VERDICT_IDS) {
      assert.ok(VERDICTS[id].label, `Verdict ${id} missing label`);
      assert.ok(VERDICTS[id].description, `Verdict ${id} missing description`);
    }
  });

  it("should define 4 claim lifecycle statuses distinct from verdicts", () => {
    assert.equal(CLAIM_STATUS_LIST.length, 4);

    assert.ok(CLAIM_STATUS_LIST.includes(CLAIM_STATUS.UNDER_REVIEW));
    assert.ok(CLAIM_STATUS_LIST.includes(CLAIM_STATUS.IN_VERIFICATION));
    assert.ok(CLAIM_STATUS_LIST.includes(CLAIM_STATUS.COMPLETED));
    assert.ok(CLAIM_STATUS_LIST.includes(CLAIM_STATUS.REJECTED));
  });

  it("should define the three user roles", () => {
    assert.equal(USER_ROLES.USER, "user");
    assert.equal(USER_ROLES.REVIEWER, "reviewer");
    assert.equal(USER_ROLES.ADMIN, "admin");
  });

  it("should define review statuses including awaiting, approved, revised, and requires investigation", async () => {
    const { REVIEW_STATUS, REVIEW_STATUS_LIST } = await import("../src/config/constants.js");
    assert.equal(REVIEW_STATUS_LIST.length, 4);
    assert.equal(REVIEW_STATUS.AWAITING_REVIEW, "AWAITING_REVIEW");
    assert.equal(REVIEW_STATUS.APPROVED, "APPROVED");
    assert.equal(REVIEW_STATUS.REVISED, "REVISED");
    assert.equal(REVIEW_STATUS.REQUIRES_FURTHER_INVESTIGATION, "REQUIRES_FURTHER_INVESTIGATION");
  });
});


describe("2. AI Provider Adapters & Factory", () => {
  it("should return a valid provider from the factory", () => {
    const provider = getAiProvider();

    assert.ok(provider);
    assert.equal(typeof provider.isConfigured, "function");
    assert.equal(typeof provider.verifyClaim, "function");

    if (provider instanceof UnconfiguredProvider) {
      assert.equal(provider.isConfigured(), false);
    } else {
      assert.equal(provider.isConfigured(), true);
    }
  });

  it("should yield INSUFFICIENT_EVIDENCE and transparent notice from UnconfiguredProvider", async () => {
    const provider = new UnconfiguredProvider();

    const result = await provider.verifyClaim({
      claimText: "Sample claim statement for automated verification",
    });

    assert.equal(
      result.verdictId,
      VERDICTS.INSUFFICIENT_EVIDENCE.id
    );

    assert.ok(
      result.summary.includes("external AI provider configuration")
    );

    assert.ok(result.assessment.includes("transparency"));

    assert.equal(result.aiMetadata.isConfigured, false);

    assert.deepEqual(result.supportingEvidence, []);
    assert.deepEqual(result.contradictingEvidence, []);
  });
});


describe("3. Evidence Retrieval Service", () => {
  const testService = new EvidenceRetrievalService({
    SEARCH_PROVIDER: "unconfigured",
    TAVILY_API_KEY: "",
  });

  it("should classify known election authorities as Statutory Election Body", () => {
    const trust = testService.classifyDomainTrust(
      "https://eci.gov.in/notifications"
    );

    assert.equal(trust, "Statutory Election Body");
  });

  it("should classify fact-checking domains appropriately", () => {
    const trust = testService.classifyDomainTrust(
      "https://www.altnews.in/elections"
    );

    assert.equal(trust, "Fact-Checking Organization");
  });

  it("should classify news media domains appropriately", () => {
    const trust = testService.classifyDomainTrust(
      "https://www.reuters.com/world/elections"
    );

    assert.equal(trust, "Recognized News Media");
  });

  it("should return empty sources cleanly when unconfigured", async () => {
    const result = await testService.retrieveEvidence({
      claimText: "Sample claim",
    });

    assert.deepEqual(result.sources, []);
    assert.equal(result.isConfigured, false);

    assert.ok(result.message.includes("not configured"));
  });
});


describe("4. Express App & Routing", () => {
  let server;
  let port;

  it("should start test HTTP server and respond to /health", async () => {
    server = http.createServer(app);

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });

    const res = await fetch(`http://127.0.0.1:${port}/health`);

    assert.equal(res.status, 200);

    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.status, "ok");
  });

  it("should respond to /api/health", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);

    assert.equal(res.status, 200);

    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.status, "healthy");
  });

  it("should return canonical metadata from /api/meta", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/meta`);

    assert.equal(res.status, 200);

    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.data.canonicalVerdicts.length, 5);
  });

  it("should return 404 for unknown routes", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/nonexistent-route-12345`
    );

    assert.equal(res.status, 404);

    const data = await res.json();

    assert.equal(data.success, false);
    assert.ok(data.error.includes("Endpoint not found"));
  });

  it("should reject invalid login credentials with 400", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "bad-email",
          password: "",
        }),
      }
    );

    assert.equal(res.status, 400);

    const data = await res.json();

    assert.equal(data.success, false);
    assert.ok(data.error);
  });

  it("should reject claim submission with short text with 400", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/claims`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimText: "hi" }),
      }
    );

    assert.equal(res.status, 400);

    const data = await res.json();

    assert.equal(data.success, false);
  });

  it("should reject registration with weak password lacking uppercase or number", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "lowercaseonly",
        }),
      }
    );

    assert.equal(res.status, 400);

    const data = await res.json();

    assert.equal(data.success, false);
    assert.ok(data.error.includes("Password must include"));
  });

  it("should reject access to protected /api/auth/me without Bearer token", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/auth/me`
    );

    assert.equal(res.status, 401);

    const data = await res.json();

    assert.equal(data.success, false);
    assert.ok(data.error.includes("Authentication required"));
  });

  it("should reject access to admin route /api/users without authentication", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/users`
    );

    assert.equal(res.status, 401);
  });

  it("should return null cleanly from claimService.getClaimById for non-ObjectId string", async () => {
    const { claimService } = await import(
      "../src/services/claimService.js"
    );

    const result = await claimService.getClaimById(
      "invalid-non-objectid-1234"
    );

    assert.equal(result, null);
  });

  it("should reject verificationService.runVerificationPipeline with invalid ID format", async () => {
    const { verificationService } = await import(
      "../src/services/verificationService.js"
    );

    await assert.rejects(
      async () => {
        await verificationService.runVerificationPipeline(
          "invalid-id-xyz"
        );
      },
      {
        message: /Invalid claim identifier format/,
        statusCode: 400,
      }
    );
  });

  it("should reject verificationService.applyHumanReview with invalid verdictId", async () => {
    const { verificationService } = await import(
      "../src/services/verificationService.js"
    );

    await assert.rejects(
      async () => {
        await verificationService.applyHumanReview({
          claimId: "507f1f77bcf86cd799439011",
          reviewerId: "507f1f77bcf86cd799439012",
          verdictId: "FAKE_VERDICT_NOT_CANONICAL",
          notes: "Testing invalid verdict rejection",
        });
      },
      {
        message: /Invalid verdictId/,
        statusCode: 400,
      }
    );
  });

  it("should preserve original AI verdict and record complete human review audit on revision", async () => {
    const { claimService } = await import("../src/services/claimService.js");
    const { verificationService } = await import("../src/services/verificationService.js");
    const { Claim } = await import("../src/models/Claim.js");
    const { VerificationReport } = await import("../src/models/VerificationReport.js");

    const claim = await claimService.submitClaim({
      claimText: "Special audit test claim for preserving AI and human review history.",
      context: "Official Election Verification Test Run",
    });

    try {
      // Create initial report representing AI outcome
      const initialReport = await VerificationReport.create({
        claim: claim._id,
        verdictId: "INSUFFICIENT_EVIDENCE",
        originalAiVerdictId: "INSUFFICIENT_EVIDENCE",
        finalVerdictId: "INSUFFICIENT_EVIDENCE",
        reviewStatus: "AWAITING_REVIEW",
        summary: "Initial automated AI assessment summary.",
        assessment: "Initial automated assessment details.",
        supportingEvidence: [],
        contradictingEvidence: [],
        sources: [],
        aiMetadata: {
          provider: "gemini",
          model: "gemini-2.5-flash",
          executionTimeMs: 450,
          tokenUsage: { prompt: 100, completion: 50, total: 150 },
          isConfigured: true,
          verificationDate: new Date(),
        },
      });

      claim.verificationReport = initialReport._id;
      claim.verdictId = initialReport.verdictId;
      await claim.save();

      // Human Reviewer revises the verdict
      const reviewerId = new (await import("mongoose")).default.Types.ObjectId();
      const reviewResult = await verificationService.applyHumanReview({
        claimId: claim._id.toString(),
        reviewerId,
        reviewerName: "Chief Election Auditor",
        decision: "REVISED",
        verdictId: "CONTRADICTED",
        notes: "Contradicted by the official Election Commission gazette publication.",
      });

      // Assert that original AI verdict is untouched while final verdict and audit reflect revision
      assert.equal(reviewResult.report.originalAiVerdictId, "INSUFFICIENT_EVIDENCE");
      assert.equal(reviewResult.report.finalVerdictId, "CONTRADICTED");
      assert.equal(reviewResult.report.verdictId, "CONTRADICTED");
      assert.equal(reviewResult.report.reviewStatus, "REVISED");
      assert.equal(reviewResult.report.humanReview.isReviewed, true);
      assert.equal(reviewResult.report.humanReview.decision, "REVISED");
      assert.equal(reviewResult.report.humanReview.reviewerName, "Chief Election Auditor");
      assert.equal(reviewResult.report.humanReview.revisedVerdictId, "CONTRADICTED");
      assert.ok(reviewResult.report.humanReview.notes.includes("official Election Commission gazette"));

      // Assert AI summary, assessment, and metadata were not wiped
      assert.equal(reviewResult.report.summary, "Initial automated AI assessment summary.");
      assert.equal(reviewResult.report.aiMetadata.provider, "gemini");

      // Assert Claim document reflects the revised verdict and status
      assert.equal(reviewResult.claim.verdictId, "CONTRADICTED");
      assert.equal(reviewResult.claim.status, "COMPLETED");
      assert.equal(reviewResult.claim.reviewStatus, "REVISED");

      // Test "REQUIRES_FURTHER_INVESTIGATION"
      const investigationResult = await verificationService.applyHumanReview({
        claimId: claim._id.toString(),
        reviewerId,
        reviewerName: "Chief Election Auditor",
        decision: "REQUIRES_FURTHER_INVESTIGATION",
        notes: "Awaiting local precinct signed ledger logs.",
      });

      assert.equal(investigationResult.claim.status, "UNDER_REVIEW");
      assert.equal(investigationResult.claim.reviewStatus, "REQUIRES_FURTHER_INVESTIGATION");
      assert.equal(investigationResult.report.humanReview.decision, "REQUIRES_FURTHER_INVESTIGATION");
    } finally {
      await VerificationReport.deleteMany({ claim: claim._id });
      await Claim.deleteOne({ _id: claim._id });
    }
  });

  it("should enforce role-based access control on human review endpoint", async () => {
    const { User } = await import("../src/models/User.js");
    const mongoose = (await import("mongoose")).default;

    const fakeClaimId = new mongoose.Types.ObjectId();
    const testUser = await User.create({
      name: "Standard Citizen User",
      email: `standard-${Date.now()}@example.com`,
      password: "Password123!",
      role: "user",
    });

    try {
      const userToken = testUser.generateAuthToken();

      const res = await fetch(
        `http://127.0.0.1:${port}/api/verification/claims/${fakeClaimId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            verdictId: "SUPPORTED",
            notes: "Attempted unauthorized review",
          }),
        }
      );

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes("Forbidden") || data.error.includes("role"));
    } finally {
      await User.deleteOne({ _id: testUser._id });
    }
  });

  it("should close test HTTP server and MongoDB connection", async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        server.closeAllConnections();
      });

      await disconnectDB();
    });
});
