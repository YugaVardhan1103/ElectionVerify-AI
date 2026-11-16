/**
 * ElectionVerify AI - Frontend Form Validation Utilities
 *
 * This module provides centralized, pure client-side validation functions.
 * All functions return a standardized result object:
 *   { isValid: boolean, error: string }
 *
 * IMPORTANT:
 * - These validations operate strictly in the browser on user input.
 * - They do NOT replace server-side validation or backend authorization.
 * - They do NOT invoke external APIs or perform verification.
 */

/**
 * Standard validation result format.
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - True if input satisfies validation rules
 * @property {string} error - Human-friendly error message, empty if valid
 */

/**
 * Validates that a required value is present and not just whitespace.
 *
 * @param {*} value - The input value to check
 * @param {string} [fieldName="Field"] - Name of the field for the error message
 * @returns {ValidationResult}
 */
export function validateRequired(value, fieldName = "Field") {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required.` };
  }

  if (typeof value === "string" && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }

  return { isValid: true, error: "" };
}

/**
 * Validates an email address format.
 *
 * Checks:
 * 1. Presence of email
 * 2. Standard email pattern: [local-part]@[domain].[tld]
 * 3. Disallows spaces and consecutive dots in the domain
 * 4. Supports standard domains as well as Internationalized Domain Names (IDN, e.g. .भारत)
 *
 * @param {string} email - Email address to validate
 * @returns {ValidationResult}
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { isValid: false, error: "Please enter your email address." };
  }

  const trimmed = email.trim();

  // Practical frontend email pattern:
  // - Local part: 1+ non-whitespace, non-@ characters
  // - Domain labels: 1+ labels separated by dots (prevents consecutive dots)
  // - Top-Level Domain (TLD): at least 2 characters, supporting internationalized scripts via /u
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/u;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true, error: "" };
}

/**
 * Validates password strength according to existing platform rules.
 *
 * Requirements:
 * - At least 8 characters in length
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric character (0-9)
 *
 * @param {string} password - The password string to validate
 * @param {string} [fieldName="Password"] - Display label for error messages
 * @returns {ValidationResult}
 */
export function validatePassword(password, fieldName = "Password") {
  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      error: `Please enter a ${fieldName.toLowerCase()}.`,
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least 8 characters.`,
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber) {
    return {
      isValid: false,
      error: `${fieldName} must contain uppercase, lowercase and numeric characters.`,
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Validates that two password fields match.
 *
 * @param {string} password - Primary password
 * @param {string} confirmPassword - Confirmation password
 * @returns {ValidationResult}
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true, error: "" };
}

/**
 * Validates a web URL format.
 *
 * Requirements:
 * - If required=false and value is empty, it is considered valid (e.g. optional source URL).
 * - Must be a parseable URL using either http: or https: protocols.
 * - Rejects dangerous/unsupported protocols like javascript:, data:, file:, ftp:.
 *
 * @param {string} url - The URL string to validate
 * @param {Object} [options]
 * @param {boolean} [options.required=false] - Whether an empty URL is rejected
 * @returns {ValidationResult}
 */
export function validateUrl(url, { required = false } = {}) {
  const isPresent = url && typeof url === "string" && url.trim().length > 0;

  if (!isPresent) {
    if (required) {
      return { isValid: false, error: "Please enter a source URL." };
    }
    return { isValid: true, error: "" };
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "Please enter a valid HTTP or HTTPS URL.",
      };
    }

    // Must have a valid hostname containing at least a domain
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { isValid: false, error: "Please enter a valid source URL." };
    }

    return { isValid: true, error: "" };
  } catch {
    return { isValid: false, error: "Please enter a valid source URL." };
  }
}

/**
 * Validates a person's name with international character and combining mark support.
 *
 * Supports:
 * - Unicode letters (\p{L}) and combining marks (\p{M}) across alphabets
 *   (English, Devanagari, Tamil, Telugu, Kannada, Malayalam, Bengali, etc.)
 * - Legitimate name separators: spaces, hyphens (-), and apostrophes (')
 * - Periods (.) for initials (e.g., "A. P. J. Abdul Kalam")
 * - Enforces a minimum of 2 characters and a reasonable maximum (100 characters)
 * - Rejects numbers, symbols, and invalid punctuation
 *
 * @param {string} name - The name to validate
 * @param {string} [fieldName="Full Name"] - Display label for error messages
 * @returns {ValidationResult}
 */
export function validateName(name, fieldName = "Full Name") {
  if (!name || typeof name !== "string" || !name.trim()) {
    return {
      isValid: false,
      error: `Please enter your ${fieldName.toLowerCase()}.`,
    };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least 2 characters.`,
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: `${fieldName} must be less than 100 characters.`,
    };
  }

  // Unicode letter & mark check:
  // - Starts with a Unicode letter (\p{L})
  // - Body contains letters (\p{L}), combining marks (\p{M}), spaces, hyphens, apostrophes, periods
  // - Ends with a letter, combining mark, or period (e.g. for initials)
  const nameRegex = /^[\p{L}][\p{L}\p{M}\s'.-]*[\p{L}\p{M}.]$/u;

  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} should only contain letters, spaces, hyphens, apostrophes, and periods.`,
    };
  }

  return { isValid: true, error: "" };
}
