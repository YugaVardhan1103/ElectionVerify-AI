import { CANONICAL_VERDICT_IDS, SUPPORTED_LANGUAGES } from "../config/constants.js";

/**
 * Validation helper function checking email regex
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/u.test(email.trim());
}

/**
 * Validate User Registration Payload
 */
export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  } else {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasNumber) {
      errors.push("Password must include uppercase, lowercase, and numeric characters.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      details: errors,
    });
  }

  next();
}

/**
 * Validate User Login Payload
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      details: errors,
    });
  }

  next();
}

/**
 * Validate Claim Submission Payload
 */
export function validateClaimSubmission(req, res, next) {
  const { claimText, language, sourceUrl } = req.body || {};
  const errors = [];

  if (!claimText || typeof claimText !== "string" || claimText.trim().length < 5) {
    errors.push("Claim statement must be at least 5 characters long.");
  }

  if (language && !SUPPORTED_LANGUAGES.includes(language)) {
    errors.push(`Language '${language}' is not supported. Supported: [${SUPPORTED_LANGUAGES.join(", ")}].`);
  }

  if (sourceUrl && typeof sourceUrl === "string" && sourceUrl.trim().length > 0) {
    try {
      const parsed = new URL(sourceUrl.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.push("Source URL must use http: or https: protocol.");
      }
    } catch {
      errors.push("Invalid source URL format.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      details: errors,
    });
  }

  next();
}

/**
 * Validate Human Review Payload
 */
export function validateHumanReview(req, res, next) {
  const { verdictId, notes, decision } = req.body || {};
  const errors = [];

  const effectiveDecision = decision || (verdictId ? "REVISED" : "APPROVED");

  if (effectiveDecision === "REVISED") {
    if (!verdictId || !CANONICAL_VERDICT_IDS.includes(verdictId)) {
      errors.push(`Verdict must be one of the canonical verdicts: [${CANONICAL_VERDICT_IDS.join(", ")}].`);
    }
    if (!notes || typeof notes !== "string" || notes.trim().length < 3) {
      errors.push("Review notes explaining the verdict reasoning are required when revising a verdict.");
    }
  } else if (verdictId && !CANONICAL_VERDICT_IDS.includes(verdictId)) {
    errors.push(`Verdict must be one of the canonical verdicts: [${CANONICAL_VERDICT_IDS.join(", ")}].`);
  }

  if (effectiveDecision === "REQUIRES_FURTHER_INVESTIGATION") {
    if (!notes || typeof notes !== "string" || notes.trim().length < 3) {
      errors.push("Review notes explaining why further investigation is required are mandatory.");
    }
  }

  if (notes && typeof notes === "string" && notes.trim().length > 0 && notes.trim().length < 3) {
    errors.push("Review notes must be at least 3 characters long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      details: errors,
    });
  }

  next();
}
