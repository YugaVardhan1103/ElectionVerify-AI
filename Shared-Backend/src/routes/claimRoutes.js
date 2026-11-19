import { Router } from "express";
import {
  submitClaim,
  getClaims,
  getClaimStats,
  getClaimById,
  updateClaim,
  deleteClaim,
} from "../controllers/claimController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateClaimSubmission } from "../middleware/validate.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

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

export default router;
