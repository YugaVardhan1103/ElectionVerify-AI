"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/Button";
import { SUPPORTED_LANGUAGES, getVerdictById } from "@/constants/verdicts";
import { validateRequired, validateUrl } from "@/lib/validators";
import { claimsApi } from "@/lib/api";
import { ClaimItem, ImageProof } from "@/types";

interface SelectedImage {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  previewUrl: string;
}

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

export default function SubmitClaimPage() {
  const router = useRouter();
  const [claim, setClaim] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [context, setContext] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General Election");

  // Image Proof / Evidence State
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [selectedImages]);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function handleFilesAdded(fileList: FileList | null) {
    setImageError("");
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_TOTAL_IMAGES = 5;

    if (selectedImages.length + incoming.length > MAX_TOTAL_IMAGES) {
      setImageError(
        `Maximum ${MAX_TOTAL_IMAGES} images allowed per claim. You can only add ${MAX_TOTAL_IMAGES - selectedImages.length} more.`
      );
      return;
    }

    const newEntries: SelectedImage[] = [];
    for (const file of incoming) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext);

      if (!isValidType) {
        setImageError(`File "${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setImageError(`File "${file.name}" exceeds the 5 MB limit (${formatFileSize(file.size)}).`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newEntries.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        previewUrl,
      });
    }

    setSelectedImages((prev) => [...prev, ...newEntries]);
  }

  function handleRemoveImage(id: string) {
    setSelectedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    setImageError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    message: string;
    claim: ClaimItem;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  function handleUseExample(example: (typeof EXAMPLE_CLAIMS)[number]) {
    setClaim(example.text);
    setSelectedCategory(example.category);
    setContext(example.context);
    setFieldErrors({});
    setGeneralError("");
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e && e.preventDefault) e.preventDefault();
    setGeneralError("");
    setSubmissionSuccess(null);
    setImageError("");
    const errors: Record<string, string> = {};

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
      let uploadedEvidence: ImageProof[] = [];
      if (selectedImages.length > 0) {
        setUploadStatusText(`Uploading ${selectedImages.length} evidence image${selectedImages.length > 1 ? "s" : ""} to Cloudinary...`);
        const uploadRes = await claimsApi.uploadEvidenceImages(selectedImages.map((item) => item.file));
        if (!uploadRes.success) {
          clearTimeout(stepTimer1);
          clearTimeout(stepTimer2);
          setIsSubmitting(false);
          setImageError(uploadRes.error || "Failed to upload evidence images. Please verify your connection.");
          return;
        }
        uploadedEvidence = uploadRes.images || [];
      }

      setUploadStatusText("");

      const result = await claimsApi.submitClaim({
        claimText: claim,
        sourceUrl,
        language,
        context,
        categoryTags: [selectedCategory],
        imageProofs: uploadedEvidence,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setActiveStep(4); // Finished

      if (result.success && result.claim) {
        // Clean up object URLs
        selectedImages.forEach((img) => {
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        });
        setSelectedImages([]);

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
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during submission.";
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatusText("");
    }
  }

  const resultVerdict =
    submissionSuccess?.claim?.verdictId
      ? getVerdictById(submissionSuccess.claim.verdictId)
      : null;

  return (
    <ProtectedRoute>
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
                      router.push(
                        `/verification-result/${
                          submissionSuccess.claim.id || submissionSuccess.claim._id
                        }`
                      )
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
                  rows={4}
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
                  rows={3}
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

              {/* Image Proof / Evidence Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-text-primary">
                    Image Proof / Evidence{" "}
                    <span className="font-normal text-text-secondary">(Optional)</span>
                  </label>
                  <span className="text-xs text-text-secondary">
                    {selectedImages.length} of 5 images selected
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragOver
                      ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/40"
                      : "border-border bg-surface hover:border-brand-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleFilesAdded(e.target.files)}
                    disabled={isSubmitting || selectedImages.length >= 5}
                  />

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/80 dark:text-brand-300">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm font-medium text-text-primary">
                    <span className="text-brand-600 hover:underline dark:text-brand-400">
                      Click to browse
                    </span>{" "}
                    or drag and drop evidence photos here
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Supports JPG, JPEG, PNG, WEBP (Max 5 MB per image &bull; Max 5 images)
                  </p>
                </div>

                {/* Image Error Alert */}
                {imageError && (
                  <div
                    role="alert"
                    className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 flex items-center justify-between"
                  >
                    <span>{imageError}</span>
                    <button
                      type="button"
                      onClick={() => setImageError("")}
                      className="font-bold ml-2 text-red-700 hover:text-red-900 dark:text-rose-200"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Selected Images Preview Grid */}
                {selectedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative overflow-hidden rounded-lg border border-border bg-surface p-1.5 shadow-sm"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                          {/* Next image or native img */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(img.id);
                            }}
                            disabled={isSubmitting}
                            title="Remove image"
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow transition-transform hover:scale-110 focus:outline-none"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-1.5 px-0.5">
                          <p
                            className="truncate text-[11px] font-medium text-text-primary"
                            title={img.name}
                          >
                            {img.name}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {img.sizeFormatted}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Status during submission */}
                {uploadStatusText && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    <span>{uploadStatusText}</span>
                  </div>
                )}

                <p className="mt-2 text-xs text-text-secondary">
                  Notice: Uploaded images are stored as supplementary claim evidence and processed securely. Evidence is not treated as automatically verified truth.
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
                    href="/verification-history"
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
    </ProtectedRoute>
  );
}
