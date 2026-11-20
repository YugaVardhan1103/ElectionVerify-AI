import { Router } from "express";
import {
  submitClaim,
  getClaims,
  getClaimStats,
  getClaimById,
  updateClaim,
  deleteClaim,
  uploadEvidenceImages,
  deleteEvidenceImage,
} from "../controllers/claimController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateClaimSubmission } from "../middleware/validate.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();

// Upload evidence image proofs (max 5 images, 5MB each, JPEG/PNG/WEBP)
router.post(
  "/upload-evidence",
  requireAuth,
  uploadMiddleware.array("images", 5),
  uploadEvidenceImages
);

// Public / Authenticated claim submission
router.post(
  "/",
  submissionLimiter,
  optionalAuth,
  validateClaimSubmission,
  submitClaim
);

// Claim listings with filtering, search, pagination (user-aware)
router.get("/", optionalAuth, getClaims);

// Derived verification stats (user-aware)
router.get("/stats", optionalAuth, getClaimStats);

// Single claim details by ID (enforces visibility & ownership)
router.get("/:id", optionalAuth, getClaimById);

// Update claim (owner or admin only)
router.put("/:id", requireAuth, updateClaim);

// Delete claim (owner or admin only)
router.delete("/:id", requireAuth, deleteClaim);

// Delete specific evidence image from claim (owner or reviewer/admin only)
router.delete("/:id/evidence/:publicId(*)", requireAuth, deleteEvidenceImage);

export default router;
