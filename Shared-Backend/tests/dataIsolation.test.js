import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Claim } from "../src/models/Claim.js";
import { VerificationReport } from "../src/models/VerificationReport.js";
import { USER_ROLES } from "../src/config/constants.js";

describe("5. Multi-User Data Isolation & Ownership Security", () => {
  let server;
  let port;

  let alphaToken = "";
  let alphaUserId = "";
  let betaToken = "";
  let betaUserId = "";
  let reviewerToken = "";
  let reviewerUserId = "";

  let alphaPrivateClaimId = "";
  let publicClaimId = "";

  const uniqueSuffix = Date.now();
  const alphaEmail = `alpha_${uniqueSuffix}@example.com`;
  const betaEmail = `beta_${uniqueSuffix}@example.com`;
  const reviewerEmail = `reviewer_${uniqueSuffix}@example.com`;

  before(async () => {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });

    // 1. Register User Alpha
    const regAlpha = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Alpha",
        email: alphaEmail,
        password: "Password123!",
      }),
    });
    const regAlphaData = await regAlpha.json();
    alphaToken = regAlphaData.data.token;
    alphaUserId = regAlphaData.data.user.id || regAlphaData.data.user._id;

    // 2. Register User Beta
    const regBeta = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Beta",
        email: betaEmail,
        password: "Password123!",
      }),
    });
    const regBetaData = await regBeta.json();
    betaToken = regBetaData.data.token;
    betaUserId = regBetaData.data.user.id || regBetaData.data.user._id;

    // 3. Register Reviewer
    const regReviewer = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Official Reviewer",
        email: reviewerEmail,
        password: "Password123!",
      }),
    });
    const regReviewerData = await regReviewer.json();
    reviewerUserId = regReviewerData.data.user.id || regReviewerData.data.user._id;

    // Elevate role to reviewer
    await User.findByIdAndUpdate(reviewerUserId, { role: USER_ROLES.REVIEWER });
    const loginReviewer = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: reviewerEmail,
        password: "Password123!",
      }),
    });
    const loginReviewerData = await loginReviewer.json();
    reviewerToken = loginReviewerData.data.token;

    // 4. Create an explicitly public claim
    const publicClaim = await Claim.create({
      title: `Public Election Guideline ${uniqueSuffix}`,
      claimText: `Official election polling hours notice for municipal voting ${uniqueSuffix}.`,
      isPublic: true,
      submittedBy: null,
      status: "COMPLETED",
      verdictId: "SUPPORTED",
    });
    publicClaimId = publicClaim._id.toString();

    // 5. User Alpha submits a private claim via API
    const subAlpha = await fetch(`http://127.0.0.1:${port}/api/claims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${alphaToken}`,
      },
      body: JSON.stringify({
        claimText: `Private submission by Alpha: unverified ballot box movement reported in sector 9 ${uniqueSuffix}.`,
        sourceUrl: "https://example.com/alpha-source",
        autoVerify: false,
      }),
    });
    const subAlphaData = await subAlpha.json();
    assert.equal(subAlpha.status, 201);
    alphaPrivateClaimId = subAlphaData.data.claim.id || subAlphaData.data.claim._id;

    // Verify claim was created as private and associated with Alpha's MongoDB ID
    const claimInDb = await Claim.findById(alphaPrivateClaimId);
    assert.equal(claimInDb.submittedBy.toString(), alphaUserId.toString());
    assert.equal(claimInDb.isPublic, false);
  });

  after(async () => {
    // Clean up created records
    if (alphaPrivateClaimId) {
      await Claim.findByIdAndDelete(alphaPrivateClaimId);
      await VerificationReport.deleteMany({ claim: alphaPrivateClaimId });
    }
    if (publicClaimId) {
      await Claim.findByIdAndDelete(publicClaimId);
    }
    await User.deleteMany({
      email: { $in: [alphaEmail, betaEmail, reviewerEmail] },
    });

    await new Promise((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
    await disconnectDB();
  });

  it("1. User Alpha can view their own private claim in general list and mine=true", async () => {
    // General list
    const resAll = await fetch(`http://127.0.0.1:${port}/api/claims`, {
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(resAll.status, 200);
    const dataAll = await resAll.json();
    const foundInAll = dataAll.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundInAll, true, "User Alpha should see their private submission in general list");

    // mine=true list
    const resMine = await fetch(`http://127.0.0.1:${port}/api/claims?mine=true`, {
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(resMine.status, 200);
    const dataMine = await resMine.json();
    const foundInMine = dataMine.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundInMine, true, "User Alpha should see their private submission in mine=true list");
  });

  it("2. User Beta CANNOT see User Alpha's private claim in general claims list", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    const foundAlphaClaim = data.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundAlphaClaim, false, "User Beta must NOT see User Alpha's private submission");

    // But User Beta CAN see the public claim
    const foundPublicClaim = data.data.claims.some((c) => (c.id || c._id) === publicClaimId);
    assert.equal(foundPublicClaim, true, "User Beta must be able to view public claims");
  });

  it("3. User Beta CANNOT see User Alpha's private claim in mine=true list", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims?mine=true`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    const foundAlphaClaim = data.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundAlphaClaim, false, "User Beta mine=true list must NOT contain User Alpha's claim");
    assert.equal(data.data.claims.length, 0, "User Beta should have 0 claims in mine=true");
  });

  it("4. IDOR Query Prevention: User Beta passing submittedBy=<alphaUserId> is quarantined", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims?submittedBy=${alphaUserId}`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    const foundAlphaClaim = data.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundAlphaClaim, false, "Manipulating submittedBy must not leak another user's submissions");
  });

  it("5. IDOR Direct Fetch: User Beta requesting GET /api/claims/:alphaClaimId receives 404", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(res.status, 404, "Accessing another user's private claim by ID must return 404 Not Found");
  });

  it("6. Guest Data Protection: Unauthenticated requests cannot view private submissions", async () => {
    const resList = await fetch(`http://127.0.0.1:${port}/api/claims`);
    assert.equal(resList.status, 200);
    const dataList = await resList.json();
    const foundAlphaClaim = dataList.data.claims.some((c) => (c.id || c._id) === alphaPrivateClaimId);
    assert.equal(foundAlphaClaim, false, "Unauthenticated guests must not see private user submissions");

    const resDirect = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`);
    assert.equal(resDirect.status, 404, "Unauthenticated direct fetch of private claim must return 404");
  });

  it("7. IDOR Modification: User Beta attempting PUT /api/claims/:alphaClaimId receives 403", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${betaToken}`,
      },
      body: JSON.stringify({
        title: "Malicious modification attempt",
      }),
    });
    assert.equal(res.status, 403, "Non-owner cannot modify another user's claim");
  });

  it("8. IDOR Deletion: User Beta attempting DELETE /api/claims/:alphaClaimId receives 403", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${betaToken}`,
      },
    });
    assert.equal(res.status, 403, "Non-owner cannot delete another user's claim");
  });

  it("9. IDOR Verification Trigger: User Beta attempting verification on Alpha claim receives 403", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/verification/claims/${alphaPrivateClaimId}/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${betaToken}`,
      },
    });
    assert.equal(res.status, 403, "Non-owner cannot trigger verification for another user's claim");
  });

  it("10. Authorized Reviewer Access: Reviewer CAN access private claim for official review", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      headers: {
        Authorization: `Bearer ${reviewerToken}`,
      },
    });
    assert.equal(res.status, 200, "Reviewer must be allowed to inspect claims for review");
    const data = await res.json();
    assert.equal((data.data.claim.id || data.data.claim._id), alphaPrivateClaimId);
  });

  it("11. Dashboard Stats Isolation: User metrics are strictly scoped to authenticated user ID", async () => {
    // User Alpha stats
    const resAlpha = await fetch(`http://127.0.0.1:${port}/api/claims/stats?scope=user`, {
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(resAlpha.status, 200);
    const dataAlpha = await resAlpha.json();
    assert.equal(dataAlpha.data.stats.totalClaims, 1, "User Alpha should have 1 submitted claim in user stats");

    // User Beta stats
    const resBeta = await fetch(`http://127.0.0.1:${port}/api/claims/stats?scope=user`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(resBeta.status, 200);
    const dataBeta = await resBeta.json();
    assert.equal(dataBeta.data.stats.totalClaims, 0, "User Beta should have 0 submitted claims in user stats");
  });

  it("12. Saved Items Isolation: Users cannot see or save other users' private items", async () => {
    // User Alpha saves the public claim
    const savePublic = await fetch(`http://127.0.0.1:${port}/api/users/saved-claims/${publicClaimId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(savePublic.status, 200);

    // User Alpha inspects saved claims
    const listAlpha = await fetch(`http://127.0.0.1:${port}/api/users/saved-claims`, {
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(listAlpha.status, 200);
    const listAlphaData = await listAlpha.json();
    assert.equal(listAlphaData.data.savedClaims.length, 1);
    assert.equal(listAlphaData.data.savedClaims[0]._id.toString(), publicClaimId);

    // User Beta inspects saved claims (must be empty)
    const listBeta = await fetch(`http://127.0.0.1:${port}/api/users/saved-claims`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(listBeta.status, 200);
    const listBetaData = await listBeta.json();
    assert.equal(listBetaData.data.savedClaims.length, 0, "User Beta must NOT see User Alpha's saved items");

    // User Beta attempts to save User Alpha's private claim -> must fail with 404
    const savePrivate = await fetch(`http://127.0.0.1:${port}/api/users/saved-claims/${alphaPrivateClaimId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assert.equal(savePrivate.status, 404, "User Beta cannot bookmark another user's private claim");
  });

  it("13. Legitimate Owner Deletion: User Alpha can delete their own claim", async () => {
    const del = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(del.status, 200);
    const delData = await del.json();
    assert.equal(delData.success, true);

    // Verify claim is gone
    const check = await fetch(`http://127.0.0.1:${port}/api/claims/${alphaPrivateClaimId}`, {
      headers: { Authorization: `Bearer ${alphaToken}` },
    });
    assert.equal(check.status, 404);
    alphaPrivateClaimId = "";
  });
});
