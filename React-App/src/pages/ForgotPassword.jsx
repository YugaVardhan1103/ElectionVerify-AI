import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
        setError("Please enter your email address.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
    }

    setSuccess("If an account exists with this email, password reset instructions will be sent.");
    setEmail("");
    }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-text-primary">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm text-text-secondary">
          Enter your registered email address and we'll help you reset your password.
        </p>

        <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit}
        noValidate
        >

          <div>
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
                {error}
            </p>
            )}

            {success && (
            <p className="text-sm text-green-600">
                {success}
            </p>
            )}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Send Reset Link
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}

export default ForgotPassword;