import { Router } from "express";
import {
  triggerVerification,
  submitHumanReview,
  getPendingReviews,
} from "../controllers/verificationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateHumanReview } from "../middleware/validate.js";
import { USER_ROLES } from "../config/constants.js";

const router = Router();

// Reviewers and Admins can trigger automated verification pipelines
router.post(
  "/claims/:id/verify",
  requireAuth,
  requireRole(USER_ROLES.REVIEWER, USER_ROLES.ADMIN),
  triggerVerification
);

// Reviewers and Admins can submit human reviews and override verdicts
router.post(
  "/claims/:id/review",
  requireAuth,
  requireRole(USER_ROLES.REVIEWER, USER_ROLES.ADMIN),
  validateHumanReview,
  submitHumanReview
);

// Reviewers and Admins can view claims pending human review
router.get(
  "/pending",
  requireAuth,
  requireRole(USER_ROLES.REVIEWER, USER_ROLES.ADMIN),
  getPendingReviews
);

export default router;
