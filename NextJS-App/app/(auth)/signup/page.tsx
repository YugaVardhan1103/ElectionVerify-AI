"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/validators";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    const errors: Record<string, string> = {};

    const nameVal = validateName(name);
    if (!nameVal.isValid) errors.name = nameVal.error;

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.email = emailVal.error;

    const passVal = validatePassword(password);
    if (!passVal.isValid) errors.password = passVal.error;

    const confirmVal = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmVal.isValid) errors.confirmPassword = confirmVal.error;

    if (!agreed) {
      errors.agreed = "Please accept the Platform Terms and Transparency Guidelines.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    const res = await register({ name, email, password });
    setIsLoading(false);

    if (res.success) {
      router.push(`/login?registered=true&email=${encodeURIComponent(email.trim())}`);
    } else {
      setGeneralError(res.error || "Account creation failed.");
    }
  };

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-text-primary">Create an Account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Join ElectionVerify AI to investigate election claims
          </p>
        </div>

        <div className="card">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="Jane Citizen"
                error={fieldErrors.name}
                required
              />
            </div>

            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="citizen@example.com"
                error={fieldErrors.email}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Password
                <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={`w-full rounded-lg border bg-surface px-4 py-2.5 pr-16 text-sm text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.password ? (
                <p role="alert" className="mt-1 text-xs text-red-600 dark:text-rose-400">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-text-secondary">
                  8+ chars with uppercase, lowercase, and numeric digits.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Confirm Password
                <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className={`w-full rounded-lg border bg-surface px-4 py-2.5 pr-16 text-sm text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  aria-invalid={fieldErrors.confirmPassword ? "true" : undefined}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.confirmPassword && (
                <p role="alert" className="mt-1 text-xs text-red-600 dark:text-rose-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-border text-brand-600"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (fieldErrors.agreed) setFieldErrors((p) => ({ ...p, agreed: "" }));
                  }}
                />
                <span>
                  I agree to the Community Verification Guidelines and civic terms of service.
                </span>
              </label>

              {fieldErrors.agreed && (
                <p role="alert" className="mt-1 text-xs text-red-600 dark:text-rose-400">
                  {fieldErrors.agreed}
                </p>
              )}
            </div>

            {generalError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300"
              >
                {generalError}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
