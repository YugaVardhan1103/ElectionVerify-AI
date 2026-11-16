
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
