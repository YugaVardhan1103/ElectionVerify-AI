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
  const [demoNotice, setDemoNotice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setDemoNotice("");

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error);
      return;
    }

    // Explicitly clarify demo mode rather than claiming an email was sent
    setDemoNotice(
      "Demo Mode: In a production environment, password reset instructions would be delivered to this address. In this client demo, account recovery is not connected."
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
            Enter your email address to review simulated account recovery.
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
                  if (demoNotice) setDemoNotice("");
                }}
                placeholder="your.email@example.com"
                error={error}
                required
              />
            </div>

            {demoNotice && (
              <div
                role="status"
                className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
              >
                {demoNotice}
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
