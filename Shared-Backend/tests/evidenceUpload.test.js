import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { isValidImageSignature } from "../src/services/cloudinaryService.js";
import { User } from "../src/models/User.js";
import { Claim } from "../src/models/Claim.js";

describe("6. Image Proof Upload & Cloudinary Security", () => {
  let server;
  let port;
  let userAlphaToken = "";
  let userBetaToken = "";
  let userAlphaId = "";
  let userBetaId = "";
  let createdClaimId = "";

  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const validWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
  ]);
  const invalidFakeBuffer = Buffer.from("MZThisIsAnExecutableFileNotAnImage");

  before(async () => {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    port = server.address().port;

    const emailAlpha = `uploader_alpha_${Date.now()}@electionverify.test`;
    const regResAlpha = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Uploader Alpha",
        email: emailAlpha,
        password: "Password123!",
      }),
    });
    const regDataAlpha = await regResAlpha.json();
    userAlphaToken = regDataAlpha.data.token;
    userAlphaId = regDataAlpha.data.user.id;

    const emailBeta = `uploader_beta_${Date.now()}@electionverify.test`;
    const regResBeta = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Uploader Beta",
        email: emailBeta,
        password: "Password123!",
      }),
    });
    const regDataBeta = await regResBeta.json();
    userBetaToken = regDataBeta.data.token;
    userBetaId = regDataBeta.data.user.id;
  });

  after(async () => {
    if (createdClaimId) {
      await Claim.findByIdAndDelete(createdClaimId);
    }
    await User.deleteMany({
      email: { $in: [userAlphaId, userBetaId] },
    });
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  });

  it("1. Magic bytes validation: strictly verifies PNG, JPEG, and WEBP signatures", () => {
    assert.equal(isValidImageSignature(validPngBuffer, "image/png"), true);
    assert.equal(isValidImageSignature(validJpegBuffer, "image/jpeg"), true);
    assert.equal(isValidImageSignature(validWebpBuffer, "image/webp"), true);

    // Mismatched or spoofed headers
    assert.equal(isValidImageSignature(invalidFakeBuffer, "image/jpeg"), false);
    assert.equal(isValidImageSignature(validPngBuffer, "image/jpeg"), false);
    assert.equal(isValidImageSignature(Buffer.from("short"), "image/png"), false);
  });

  it("2. Authentication guard: rejects unauthenticated upload attempts with 401", async () => {
    const boundary = "---------------------------974767299852498929531610575";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="images"; filename="test.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      validPngBuffer.toString("binary") +
      `\r\n--${boundary}--\r\n`;

    const res = await fetch(`http://127.0.0.1:${port}/api/claims/upload-evidence`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: Buffer.from(body, "binary"),
    });

    assert.equal(res.status, 401);
  });

  it("3. MIME validation: rejects non-image uploads with 400", async () => {
    const boundary = "---------------------------974767299852498929531610575";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="images"; filename="malicious.exe"\r\n` +
      `Content-Type: application/x-msdownload\r\n\r\n` +
      invalidFakeBuffer.toString("binary") +
      `\r\n--${boundary}--\r\n`;

    const res = await fetch(`http://127.0.0.1:${port}/api/claims/upload-evidence`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAlphaToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: Buffer.from(body, "binary"),
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes("Invalid file format") || json.error.includes("signature"));
  });

  it("4. Claim submission with image proofs: attaches proofs to claim in MongoDB", async () => {
    const mockImageProof = {
      url: "http://res.cloudinary.com/sefjntk4/image/upload/v1795166049/test.png",
      secureUrl: "https://res.cloudinary.com/sefjntk4/image/upload/v1795166049/test.png",
      publicId: "electionverify/evidence/test_proof_alpha_01",
      format: "png",
      width: 800,
      height: 600,
      bytes: 12345,
      originalName: "ballot_box.png",
    };

    const res = await fetch(`http://127.0.0.1:${port}/api/claims`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAlphaToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        claimText: "Voting slips count discrepancy reported at Polling Booth 4B with attached photographic proof.",
        sourceUrl: "https://example.com/ballot-report",
        language: "English",
        context: "Constituency election observation report.",
        categoryTags: ["Counting & Results"],
        imageProofs: [mockImageProof],
      }),
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.claim);
    assert.equal(json.data.claim.imageProofs.length, 1);
    assert.equal(json.data.claim.imageProofs[0].publicId, mockImageProof.publicId);
    assert.equal(json.data.claim.imageProofs[0].secureUrl, mockImageProof.secureUrl);

    createdClaimId = json.data.claim._id;

    // Verify directly in MongoDB
    const claimInDb = await Claim.findById(createdClaimId);
    assert.ok(claimInDb);
    assert.equal(claimInDb.imageProofs.length, 1);
    assert.equal(claimInDb.imageProofs[0].originalName, "ballot_box.png");
    assert.equal(claimInDb.imageProofs[0].uploadedBy.toString(), userAlphaId);
  });

  it("5. Multi-User Isolation: User Beta CANNOT delete User Alpha's evidence image (403)", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/claims/${createdClaimId}/evidence/electionverify/evidence/test_proof_alpha_01`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userBetaToken}`,
        },
      }
    );

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.ok(json.error.includes("not authorized"));

    // Verify image was NOT deleted from MongoDB
    const claimInDb = await Claim.findById(createdClaimId);
    assert.equal(claimInDb.imageProofs.length, 1);
  });

  it("6. Authorized Deletion: Claim owner User Alpha CAN delete their own evidence image (200)", async () => {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/claims/${createdClaimId}/evidence/electionverify/evidence/test_proof_alpha_01`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userAlphaToken}`,
        },
      }
    );

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    // Verify image was removed from MongoDB
    const claimInDb = await Claim.findById(createdClaimId);
    assert.equal(claimInDb.imageProofs.length, 0);
  });
});
