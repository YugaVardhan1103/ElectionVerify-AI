"use client";

import React, { useState } from "react";
import Link from "next/link";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { validateEmail } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error);
      return;
    }

    setNotice(
      "If an account is associated with this email address, password reset instructions have been sent. Please check your inbox."
    );
  };

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-text-primary">
            Password Recovery
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your registered email address to receive password reset instructions.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                  if (notice) setNotice("");
                }}
                placeholder="voter@example.com"
                error={error}
                required
              />
            </div>

            {notice && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {notice}
              </div>
            )}

            <Button type="submit" className="w-full">
              Send Recovery Request
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
