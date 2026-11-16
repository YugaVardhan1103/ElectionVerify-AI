export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export function validateRequired(value: unknown, fieldName = "Field"): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (typeof value === "string" && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true, error: "" };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { isValid: false, error: "Please enter your email address." };
  }
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/u;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please enter a valid email address." };
  }
  return { isValid: true, error: "" };
}

export function validatePassword(password: string, fieldName = "Password"): ValidationResult {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: `Please enter a ${fieldName.toLowerCase()}.` };
  }
  if (password.length < 8) {
    return { isValid: false, error: `${fieldName} must contain at least 8 characters.` };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber) {
    return {
      isValid: false,
      error: `${fieldName} must contain uppercase, lowercase, and numeric characters.`,
    };
  }
  return { isValid: true, error: "" };
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }
  return { isValid: true, error: "" };
}

export function validateUrl(url: string, { required = false } = {}): ValidationResult {
  const isPresent = url && typeof url === "string" && url.trim().length > 0;
  if (!isPresent) {
    if (required) {
      return { isValid: false, error: "Please enter a source URL." };
    }
    return { isValid: true, error: "" };
  }
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Please enter a valid HTTP or HTTPS URL." };
    }
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { isValid: false, error: "Please enter a valid source URL." };
    }
    return { isValid: true, error: "" };
  } catch {
    return { isValid: false, error: "Please enter a valid source URL." };
  }
}

export function validateName(name: string, fieldName = "Full Name"): ValidationResult {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { isValid: false, error: `Please enter your ${fieldName.toLowerCase()}.` };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must contain at least 2 characters.` };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} must be less than 100 characters.` };
  }
  const nameRegex = /^[\p{L}][\p{L}\p{M}\s'.-]*[\p{L}\p{M}.]$/u;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} should only contain letters, spaces, hyphens, apostrophes, and periods.`,
    };
  }
  return { isValid: true, error: "" };
}
