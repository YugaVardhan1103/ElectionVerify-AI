import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/useAuth.js";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../utils/validators.js";

/**
 * ElectionVerify AI - Signup Page
 *
 * Implements client-side demo account registration with form validation
 * and explicit demonstration notices.
 */
function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");
    const errors = {};

    const nameVal = validateName(name);
    if (!nameVal.isValid) {
      errors.name = nameVal.error;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      errors.email = emailVal.error;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      errors.password = passVal.error;
    }

    const confirmVal = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmVal.isValid) {
      errors.confirmPassword = confirmVal.error;
    }

    if (!agreed) {
      errors.agreed = "Please accept the Terms and Conditions to proceed.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = await signup({
      name,
      email,
      password,
      confirmPassword,
      agreedToTerms: agreed,
    });

    setIsLoading(false);

    if (result.success) {
      navigate("/login", {
        state: {
          successMessage: "Account created successfully! Please log in with your credentials.",
          email: email.trim(),
        },
      });
    } else {
      setGeneralError(result.error || "Signup failed.");
    }
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Page Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="mt-2 text-text-secondary">
            Get started with ElectionVerify AI
          </p>
        </div>

        {/* Signup Form */}
        <div className="card">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div>
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="e.g. Jane Doe"
                error={fieldErrors.name}
                required
              />
            </div>

            {/* Email */}
            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="jane.doe@example.com"
                error={fieldErrors.email}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Password
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={`w-full rounded-lg border bg-surface px-4 py-3 pr-20 text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
                >
                  {fieldErrors.password}
                </p>
              )}

              <p className="mt-2 text-xs text-text-secondary">
                At least 8 characters with uppercase, lowercase, and numeric
                digits.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Confirm Password
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-lg border bg-surface px-4 py-3 pr-20 text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                    }
                  }}
                  aria-invalid={
                    fieldErrors.confirmPassword ? "true" : undefined
                  }
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-border text-brand-600"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (fieldErrors.agreed) {
                      setFieldErrors((prev) => ({ ...prev, agreed: "" }));
                    }
                  }}
                />
                <span>
                  I agree to the Terms of Service and Community Guidelines.
                </span>
              </label>

              {fieldErrors.agreed && (
                <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-rose-400">
                  {fieldErrors.agreed}
                </p>
              )}
            </div>

            {generalError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-danger dark:bg-rose-950/40 dark:text-rose-300"
              >
                {generalError}
              </div>
            )}

            {/* Signup Button */}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
