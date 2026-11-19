import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { validateEmail } from "../utils/validators.js";

/**
 * ElectionVerify AI - Forgot Password Page
 *
 * Provides a clean client-side interface with clear demonstration notices
 * explaining that reset emails are not dispatched in demo mode.
 */
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [statusNotice, setStatusNotice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatusNotice("");

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error);
      return;
    }

    setStatusNotice(
      "If an account matches this email address, password reset instructions have been sent. Please check your inbox."
    );
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-text-primary">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm text-text-secondary">
            Enter your email address to receive password reset instructions.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                  if (statusNotice) setStatusNotice("");
                }}
                placeholder="your.email@example.com"
                error={error}
                required
              />
            </div>

            {statusNotice && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {statusNotice}
              </div>
            )}

            <Button type="submit" className="w-full">
              Send Reset Request
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
