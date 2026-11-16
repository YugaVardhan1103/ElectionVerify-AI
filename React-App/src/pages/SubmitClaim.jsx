import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { submitClaim } from "../services/claimService.js";
import { SUPPORTED_LANGUAGES } from "../data/mockData.js";
import { validateRequired, validateUrl } from "../utils/validators.js";

/**
 * ElectionVerify AI - Submit Claim Page
 *
 * Captures user claim submissions with client-side validation,
 * stores the submission in the active session's in-memory claims store,
 * and displays an explicit demonstration notification.
 */
function SubmitClaim() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [context, setContext] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");
    setSubmissionSuccess(null);
    const errors = {};

    const claimVal = validateRequired(claim, "Claim statement");
    if (!claimVal.isValid) {
      errors.claim = claimVal.error;
    }

    const urlVal = validateUrl(sourceUrl, { required: false });
    if (!urlVal.isValid) {
      errors.sourceUrl = urlVal.error;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await submitClaim({
      claim,
      claimText: claim,
      sourceUrl,
      language,
      context,
    });

    setIsSubmitting(false);

    if (result.success && result.claim) {
      setSubmissionSuccess({
        message:
          result.message ||
          "Claim submitted successfully. It has been queued in the 'Under Review' status.",
        claimId: result.claim.id || result.claim._id,
      });
      setClaim("");
      setSourceUrl("");
      setLanguage("English");
      setContext("");
    } else {
      setGeneralError(result.error || "Failed to submit claim.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Submit a Claim</h1>
        <p className="mt-2 text-text-secondary">
          Submit an election-related statement to simulate automated verification.
        </p>

        {/* Demo Mode Notice */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
          <span className="font-semibold">Demonstration Workflow:</span> Claims submitted here are stored in memory for your current session in the "Under Review" state. No actual web crawling, factual verification, or AI pipeline runs in this frontend demo.
        </div>

        {submissionSuccess && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Claim Recorded (Demo Mode)
                </p>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  {submissionSuccess.message}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    navigate(`/verification-result/${submissionSuccess.claimId}`)
                  }
                >
                  View Record &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="card mt-6">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Claim Statement */}
            <div>
              <label
                htmlFor="claim"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Claim Statement
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <textarea
                id="claim"
                rows="4"
                placeholder="Enter the election-related statement you want to investigate..."
                className={`w-full resize-y rounded-lg border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:ring-2 ${
                  fieldErrors.claim
                    ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                    : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                }`}
                value={claim}
                onChange={(e) => {
                  setClaim(e.target.value);
                  if (fieldErrors.claim) {
                    setFieldErrors((prev) => ({ ...prev, claim: "" }));
                  }
                }}
                aria-invalid={fieldErrors.claim ? "true" : undefined}
                aria-describedby={fieldErrors.claim ? "claim-error" : undefined}
              />

              {fieldErrors.claim ? (
                <p
                  id="claim-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
                >
                  {fieldErrors.claim}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-text-secondary">
                  Provide the core claim or quote as clearly and objectively as possible.
                </p>
              )}
            </div>

            {/* Source URL */}
            <div>
              <label
                htmlFor="sourceUrl"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Source URL{" "}
                <span className="font-normal text-text-secondary">
                  (Optional)
                </span>
              </label>

              <input
                id="sourceUrl"
                type="url"
                placeholder="https://example.com/article"
                className={`w-full rounded-lg border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:ring-2 ${
                  fieldErrors.sourceUrl
                    ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                    : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                }`}
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  if (fieldErrors.sourceUrl) {
                    setFieldErrors((prev) => ({ ...prev, sourceUrl: "" }));
                  }
                }}
                aria-invalid={fieldErrors.sourceUrl ? "true" : undefined}
                aria-describedby={
                  fieldErrors.sourceUrl ? "sourceUrl-error" : undefined
                }
              />

              {fieldErrors.sourceUrl ? (
                <p
                  id="sourceUrl-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
                >
                  {fieldErrors.sourceUrl}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-text-secondary">
                  Link to the original public post, media report, or announcement.
                </p>
              )}
            </div>

            {/* Language Selection */}
            <div>
              <label
                htmlFor="language"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Claim Language
              </label>

              <select
                id="language"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-text-secondary">
                Select the primary language of the submitted statement.
              </p>
            </div>

            {/* Additional Context */}
            <div>
              <label
                htmlFor="context"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Additional Context{" "}
                <span className="font-normal text-text-secondary">
                  (Optional)
                </span>
              </label>

              <textarea
                id="context"
                rows="3"
                placeholder="Mention the election, region, date, or specific circumstances..."
                className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                Helpful context like location, jurisdiction, or key dates.
              </p>
            </div>

            {generalError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-danger dark:bg-rose-950/40 dark:text-rose-300"
              >
                {generalError}
              </div>
            )}

            {/* Submit Action */}
            <div className="border-t border-border pt-6">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Submit for Verification
              </Button>

              <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                <span>All submissions are simulated in client memory.</span>
                <Link
                  to="/verification-history"
                  className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View past submissions &rarr;
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SubmitClaim;
