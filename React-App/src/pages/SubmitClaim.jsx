import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { submitClaim } from "../services/claimService.js";
import { SUPPORTED_LANGUAGES } from "../data/mockData.js";
import { validateRequired, validateUrl } from "../utils/validators.js";
import { getVerdictById } from "../constants/verdicts.js";

const CATEGORY_OPTIONS = [
  "General Election",
  "Voter Registration",
  "EVM & Security",
  "Polling Guidelines",
  "Counting & Results",
  "Model Code of Conduct",
];

const EXAMPLE_CLAIMS = [
  {
    title: "VVPAT Verification",
    text: "The Election Commission requires mandatory physical counting of VVPAT paper slips for randomly selected polling stations in every assembly constituency.",
    category: "Counting & Results",
    context: "Statutory counting protocol and transparency verification guidelines.",
  },
  {
    title: "Mobile Phone Restrictions",
    text: "Mobile phones, smartwatches, and wireless recording devices are strictly prohibited inside the voting compartment on election day.",
    category: "Polling Guidelines",
    context: "Voter secrecy and polling station security regulations.",
  },
  {
    title: "Voter Registration Deadline",
    text: "The statutory deadline for submitting Form 6 for inclusion of names in the electoral roll has been extended to November 30.",
    category: "Voter Registration",
    context: "Special summary revision of electoral rolls announcement.",
  },
];

/**
 * ElectionVerify AI - Professional Claim Submission & Automatic Verification Experience
 */
function SubmitClaim() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [context, setContext] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General Election");

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  function handleUseExample(example) {
    setClaim(example.text);
    setSelectedCategory(example.category);
    setContext(example.context);
    setFieldErrors({});
    setGeneralError("");
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setGeneralError("");
    setSubmissionSuccess(null);
    const errors = {};

    const claimVal = validateRequired(claim, "Claim statement");
    if (!claimVal.isValid) {
      errors.claim = claimVal.error;
    } else if (claim.trim().length < 5) {
      errors.claim = "Claim statement must be at least 5 characters long.";
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
    setActiveStep(1); // Submitting to database

    // Progress step simulation for smooth user feedback during verification await
    const stepTimer1 = setTimeout(() => setActiveStep(2), 1200); // Evidence retrieval
    const stepTimer2 = setTimeout(() => setActiveStep(3), 3200); // AI Analysis

    try {
      const result = await submitClaim({
        claim,
        claimText: claim,
        sourceUrl,
        language,
        context,
        categoryTags: [selectedCategory],
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setActiveStep(4); // Finished

      if (result.success && result.claim) {
        setSubmissionSuccess({
          message:
            result.message ||
            "Claim submitted and analyzed through the verification pipeline.",
          claim: result.claim,
        });
        setClaim("");
        setSourceUrl("");
        setContext("");
      } else {
        setGeneralError(result.error || "Failed to submit claim for verification.");
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setGeneralError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const resultVerdict =
    submissionSuccess?.claim?.verdictId
      ? getVerdictById(submissionSuccess.claim.verdictId)
      : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Submit Claim for AI Verification
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Submit public election statements, media articles, or viral quotes for multi-source
            evidence retrieval and AI-assisted factual verification.
          </p>
        </div>

        {/* Live Pipeline Status Banner */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-xs text-brand-900 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse" aria-hidden="true" />
            <span className="font-semibold">Automatic Evidence &amp; AI Analysis Engine:</span>
          </div>
          <p className="mt-1 leading-relaxed">
            Claims are verified against authoritative statutory repositories (e.g. Election Commissions, Official Gazettes),
            fact-checking consortiums, and credible publications. Citations are strictly validated to prevent hallucinations.
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Sample Claims (Click to populate)
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {EXAMPLE_CLAIMS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUseExample(ex)}
                disabled={isSubmitting}
                className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3 text-left transition-all hover:border-brand-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div>
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                    {ex.category}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {ex.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-text-secondary">
                    {ex.text}
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-medium text-brand-600 dark:text-brand-400">
                  Use Example &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Verification Progress Stepper (Visible while submitting) */}
        {isSubmitting && (
          <div className="card space-y-4 border-brand-200 bg-brand-50/30 dark:border-brand-800/60 dark:bg-brand-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                AI Verification in Progress
              </span>
              <span className="text-xs text-text-secondary">Step {activeStep} of 4</span>
            </div>

            {/* Stepper Dots & Labels */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { step: 1, label: "Saving Claim", desc: "Database persistence" },
                { step: 2, label: "Tavily Search", desc: "Evidence retrieval" },
                { step: 3, label: "Gemini Analysis", desc: "Cross-referencing" },
                { step: 4, label: "Report Ready", desc: "Verdict persistence" },
              ].map((s) => {
                const isComplete = activeStep > s.step;
                const isCurrent = activeStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`rounded-lg border p-3 transition-colors ${
                      isCurrent
                        ? "border-brand-500 bg-surface shadow-sm ring-1 ring-brand-500"
                        : isComplete
                        ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/30"
                        : "border-border bg-surface/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          isComplete
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-brand-600 text-white animate-pulse"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {isComplete ? "✓" : s.step}
                      </span>
                      <p className="text-xs font-semibold text-text-primary">{s.label}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-text-secondary">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submission Success & Immediate Verdict Presentation */}
        {submissionSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">
                    ✓
                  </span>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Verification Pipeline Execution Complete
                  </p>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {submissionSuccess.message}
                </p>

                {resultVerdict && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs font-semibold text-text-secondary">Assigned Verdict:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${resultVerdict.badgeClass}`}
                    >
                      {resultVerdict.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    navigate(`/verification-result/${submissionSuccess.claim.id || submissionSuccess.claim._id}`)
                  }
                >
                  View Full Report &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Submission Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Claim Statement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="claim"
                  className="text-sm font-semibold text-text-primary"
                >
                  Claim Statement
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <span className="text-xs text-text-secondary">
                  {claim.length} / 5000 characters
                </span>
              </div>

              <textarea
                id="claim"
                rows="4"
                placeholder="Enter the election-related statement, press release quote, or social media claim to verify..."
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
                disabled={isSubmitting}
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
                  Provide the core claim as clearly as possible. Minimum 5 characters.
                </p>
              )}
            </div>

            {/* Category Tag Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30 dark:bg-brand-500"
                          : "border border-border bg-surface text-text-secondary hover:border-brand-500 hover:text-text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source URL & Language Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  disabled={isSubmitting}
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
                    Link to the original public post or media source.
                  </p>
                )}
              </div>

              {/* Language Selection */}
              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-semibold text-text-primary"
                >
                  Statement Language
                </label>

                <select
                  id="language"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isSubmitting}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-text-secondary">
                  Primary language of the election claim.
                </p>
              </div>
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
                placeholder="Mention jurisdiction, specific election phase, assembly constituency, or key dates..."
                className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={isSubmitting}
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                Contextual details help guide the multi-source evidence discovery engine.
              </p>
            </div>

            {generalError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-red-50 p-3.5 text-sm text-danger dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <div className="flex items-center justify-between">
                  <span>{generalError}</span>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="ml-3 font-semibold underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="border-t border-border pt-6">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Running AI Verification..." : "Submit & Verify Statement"}
              </Button>

              <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                <span>Verified claims are permanently auditable in history.</span>
                <Link
                  to="/verification-history"
                  className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View claim history &rarr;
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
