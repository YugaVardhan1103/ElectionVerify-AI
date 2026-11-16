"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/Button";
import { SUPPORTED_LANGUAGES } from "@/constants/verdicts";
import { validateRequired, validateUrl } from "@/lib/validators";
import { claimsApi } from "@/lib/api";

export default function SubmitClaimPage() {
  const router = useRouter();
  const [claimText, setClaimText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [context, setContext] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ claimId: string; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessInfo(null);
    const errors: Record<string, string> = {};

    const claimVal = validateRequired(claimText, "Claim statement");
    if (!claimVal.isValid) errors.claimText = claimVal.error;

    const urlVal = validateUrl(sourceUrl, { required: false });
    if (!urlVal.isValid) errors.sourceUrl = urlVal.error;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const res = await claimsApi.submitClaim({
      claimText,
      sourceUrl,
      language,
      context,
    });
    setIsSubmitting(false);

    if (res.success && res.claim) {
      setSuccessInfo({
        claimId: res.claim.id || res.claim._id || "",
        message:
          res.message ||
          "Claim submitted successfully. It has been queued in the 'Under Review' status.",
      });
      setClaimText("");
      setSourceUrl("");
      setLanguage("English");
      setContext("");
    } else {
      setGeneralError(res.error || "Failed to submit claim.");
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-text-primary">
            Submit an Election Claim
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Submit a statement or circulating rumor to initiate evidence retrieval and fact-checking.
          </p>

          {/* Demonstration Notice */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="font-semibold">Workflow Notice:</span> All new claims enter the verification lifecycle in the &quot;Under Review&quot; status. When the backend AI engine is unconfigured, claims are directed to certified human review queues without fabricating artificial verdicts.
          </div>

          {successInfo && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Claim Recorded
                  </p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    {successInfo.message}
                  </p>
                </div>
                {successInfo.claimId && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      router.push(`/verification-result/${successInfo.claimId}`)
                    }
                  >
                    View Record &rarr;
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="card mt-6">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Claim Statement */}
              <div>
                <label
                  htmlFor="claimText"
                  className="mb-1.5 block text-sm font-semibold text-text-primary"
                >
                  Claim Statement
                  <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                </label>

                <textarea
                  id="claimText"
                  rows={4}
                  placeholder="Enter the election statement you want to investigate..."
                  className={`w-full resize-y rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.claimText
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={claimText}
                  onChange={(e) => {
                    setClaimText(e.target.value);
                    if (fieldErrors.claimText) setFieldErrors((p) => ({ ...p, claimText: "" }));
                  }}
                  aria-invalid={fieldErrors.claimText ? "true" : undefined}
                />

                {fieldErrors.claimText ? (
                  <p role="alert" className="mt-1 text-xs text-red-600 dark:text-rose-400">
                    {fieldErrors.claimText}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-text-secondary">
                    Provide the core statement as objectively and completely as possible.
                  </p>
                )}
              </div>

              {/* Source URL */}
              <div>
                <label
                  htmlFor="sourceUrl"
                  className="mb-1.5 block text-sm font-semibold text-text-primary"
                >
                  Source URL <span className="font-normal text-text-secondary">(Optional)</span>
                </label>

                <input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://example.com/social-post"
                  className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.sourceUrl
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={sourceUrl}
                  onChange={(e) => {
                    setSourceUrl(e.target.value);
                    if (fieldErrors.sourceUrl) setFieldErrors((p) => ({ ...p, sourceUrl: "" }));
                  }}
                  aria-invalid={fieldErrors.sourceUrl ? "true" : undefined}
                />

                {fieldErrors.sourceUrl ? (
                  <p role="alert" className="mt-1 text-xs text-red-600 dark:text-rose-400">
                    {fieldErrors.sourceUrl}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-text-secondary">
                    Link to the original public post, tweet, or article where you encountered the claim.
                  </p>
                )}
              </div>

              {/* Language Selection */}
              <div>
                <label
                  htmlFor="language"
                  className="mb-1.5 block text-sm font-semibold text-text-primary"
                >
                  Claim Language
                </label>

                <select
                  id="language"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Context */}
              <div>
                <label
                  htmlFor="context"
                  className="mb-1.5 block text-sm font-semibold text-text-primary"
                >
                  Additional Context <span className="font-normal text-text-secondary">(Optional)</span>
                </label>

                <textarea
                  id="context"
                  rows={3}
                  placeholder="Specify jurisdiction, dates, election type, or background circumstances..."
                  className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />

                <p className="mt-1 text-xs text-text-secondary">
                  Any relevant background details to assist investigators.
                </p>
              </div>

              {generalError && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300"
                >
                  {generalError}
                </div>
              )}

              <div className="border-t border-border pt-5">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Submit for Verification
                </Button>

                <div className="mt-4 flex justify-between text-xs text-text-secondary">
                  <span>Submissions are protected under platform integrity rules.</span>
                  <Link
                    href="/verification-history"
                    className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    View Past Claims &rarr;
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
