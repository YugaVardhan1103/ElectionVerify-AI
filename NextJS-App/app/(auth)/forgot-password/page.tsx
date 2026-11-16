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
      "Demonstration Mode: In production, password reset instructions would be delivered to this email. In this demonstration deployment, automated email dispatch is unconfigured."
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
            Enter your registered email address to request account recovery.
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
                className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
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
