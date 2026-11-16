import { Router } from "express";
import {
  submitClaim,
  getClaims,
  getClaimStats,
  getClaimById,
} from "../controllers/claimController.js";
import { optionalAuth } from "../middleware/auth.js";
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

// Claim listings with filtering, search, pagination
router.get("/", getClaims);

// Derived verification stats
router.get("/stats", getClaimStats);

// Single claim details by ID
router.get("/:id", getClaimById);

export default router;
