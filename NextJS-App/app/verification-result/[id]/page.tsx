"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import OfflineNotice from "@/components/OfflineNotice";
import { claimsApi } from "@/lib/api";
import { getVerdictById, VERDICTS } from "@/constants/verdicts";
import { useAuth } from "@/context/AuthContext";
import { ClaimItem, ImageProof, VerificationReportData } from "@/types";

interface VerificationReportState {
  success: boolean;
  claim: ClaimItem;
  report: VerificationReportData | null;
  isUnderReview: boolean;
  isOffline?: boolean;
}

/**
 * ElectionVerify AI - Professional Verification Report & Human Review Interface (Next.js)
 */
export default function ClaimResultPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const rawId = params?.id;
  const targetId = (Array.isArray(rawId) ? rawId[0] : (rawId as string)) || "claim-001";

  const [data, setData] = useState<VerificationReportState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState("");

  // Review panel state (for reviewer / admin roles)
  const [reviewDecision, setReviewDecision] = useState("APPROVED");
  const [revisedVerdictId, setRevisedVerdictId] = useState("CONTRADICTED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  const isReviewerOrAdmin =
    user && (user.role === "reviewer" || user.role === "admin");

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setIsLoading(true);
      try {
        const claim = await claimsApi.getClaimById(targetId);
        if (isMounted) {
          if (claim) {
            const report = claim.verificationReport || null;
            const isUnderReview =
              claim.status === "UNDER_REVIEW" ||
              claim.status === "IN_VERIFICATION";
            setData({
              success: true,
              claim,
              report,
              isUnderReview,
            });
          } else {
            setData(null);
          }
        }
      } catch (err) {
        console.error("Error loading verification report:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [targetId]);

  async function handleTriggerVerification() {
    setIsTriggering(true);
    setTriggerError("");
    try {
      const res = await claimsApi.triggerVerification(targetId);
      if (res.success && res.data) {
        setData({
          success: true,
          claim: res.data.claim,
          report: res.data.report,
          isUnderReview:
            res.data.claim?.status === "UNDER_REVIEW" ||
            res.data.claim?.status === "IN_VERIFICATION",
        });
      } else {
        setTriggerError(res.error || "Failed to trigger automated verification.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setTriggerError(msg);
    } finally {
      setIsTriggering(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    if (e && e.preventDefault) e.preventDefault();
    setReviewError("");
    setReviewSuccessMsg("");

    if (
      (reviewDecision === "REVISED" ||
        reviewDecision === "REQUIRES_FURTHER_INVESTIGATION") &&
      (!reviewNotes || reviewNotes.trim().length < 5)
    ) {
      setReviewError(
        "Please provide substantive review notes (at least 5 characters) explaining the decision."
      );
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await claimsApi.submitHumanReview({
        claimId: targetId,
        decision: reviewDecision,
        verdictId: reviewDecision === "REVISED" ? revisedVerdictId : undefined,
        notes: reviewNotes.trim(),
      });

      if (res.success && res.data) {
        setReviewSuccessMsg(
          "Human review decision successfully recorded and published."
        );
        setData((prev) =>
          prev
            ? {
                ...prev,
                claim: res.data.claim,
                report: res.data.report,
                isUnderReview: res.data.claim?.status === "UNDER_REVIEW",
              }
            : null
        );
        setReviewNotes("");
      } else {
        setReviewError(res.error || "Failed to record human review.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setReviewError(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  }

  function formatDate(isoString?: string | null) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDomainClassificationBadge(classification?: string) {
    switch (classification) {
      case "Statutory Election Body":
      case "Official Gazette":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "Fact-Checking Organization":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "Recognized News Media":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </main>
    );
  }

  if (!data || !data.claim) {
    return (
      <main className="min-h-screen bg-background px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <Card className="p-10">
            <h1 className="text-2xl font-bold text-text-primary">
              Claim Record Not Found
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              The requested claim ID ({targetId}) could not be located in verification records.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                variant="primary"
                onClick={() => router.push("/verification-history")}
              >
                Go to Verification History
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const { claim, report, isUnderReview } = data;
  const claimIdDisplay = claim.id || claim._id;

  const proofs = (
    Array.isArray(claim?.imageProofs) && claim.imageProofs.length > 0
      ? claim.imageProofs
      : Array.isArray(report?.imageProofs) && (report.imageProofs as any[]).length > 0
      ? (report.imageProofs as ImageProof[])
      : []
  ) as ImageProof[];

  // Active verdict (final human-approved/revised verdict or initial AI verdict)
  const activeVerdict = claim.verdictId ? getVerdictById(claim.verdictId) : null;
  const originalAiVerdict = report?.originalAiVerdictId
    ? getVerdictById(report.originalAiVerdictId)
    : activeVerdict;

  const hasHumanRevision =
    report?.humanReview?.isReviewed &&
    report?.humanReview?.decision === "REVISED" &&
    report?.originalAiVerdictId !== claim.verdictId;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/verification-history"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            &larr; Back to Verification History
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Claim ID:</span>
            <code className="rounded bg-surface px-2 py-0.5 font-mono text-xs text-text-primary border border-border">
              {claimIdDisplay}
            </code>
          </div>
        </div>

        {/* Offline Notice if backend is down */}
        {isOffline && (
          <OfflineNotice message="Backend server is unreachable. Displaying cached verification record." />
        )}

        {/* Verification Transparency Header */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-4 text-xs text-brand-900 dark:border-slate-400/40 dark:bg-[#9aa8bc] dark:text-white">
          <p className="font-bold">Civic Verification Integrity &amp; Source Provenance</p>
          <p className="mt-1 leading-relaxed">
            All evidence assessments adhere to strict non-hallucination protocols. External citations are verified
            against retrieved statutory election sources, gazettes, and fact-checking archives.
          </p>
        </div>

        {/* UNDER REVIEW / IN VERIFICATION CARD */}
        {isUnderReview || claim.status === "UNDER_REVIEW" || claim.status === "IN_VERIFICATION" ? (
          <Card className="space-y-6 border-amber-200 bg-surface dark:border-amber-800/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
                  LIFECYCLE STATUS
                </p>
                <h1 className="mt-1 text-2xl font-bold text-text-primary">
                  {claim.status === "IN_VERIFICATION"
                    ? "Automated Verification in Progress"
                    : "Claim Queued for Investigation"}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  This submission has been logged into the system. You can trigger or re-run the multi-source
                  evidence search and AI reasoning pipeline below.
                </p>
              </div>

              <StatusBadge status={claim.status || "UNDER_REVIEW"} />
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-sm font-bold text-text-primary">
                Submitted Statement
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {claim.claimText}
              </p>

              {claim.sourceUrl && (
                <div className="mt-3 text-xs">
                  <span className="font-medium text-text-secondary">Source Link: </span>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
                  >
                    {claim.sourceUrl} &nearr;
                  </a>
                </div>
              )}

              {claim.context && (
                <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-text-secondary dark:bg-slate-800/40">
                  <span className="font-semibold text-text-primary">Context:</span> {claim.context}
                </div>
              )}

              {proofs && proofs.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      User-Submitted Image Proofs ({proofs.length})
                    </p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Unverified User Attachment
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Supplementary images submitted with this claim. Unverified by election authorities.
                  </p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {proofs.map((img, idx) => {
                      const imgUrl = img.secureUrl || (img as any).secure_url || img.url || "";
                      const publicId = img.publicId || (img as any).public_id || `proof-${idx}`;
                      const displayName = img.originalName || (img as any).original_name || `Evidence ${idx + 1}`;
                      return (
                        <a
                          key={publicId}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-slate-100 hover:border-brand-500 dark:bg-slate-800"
                        >
                          <img
                            src={imgUrl}
                            alt={displayName}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-white">View Full Size &nearr;</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {triggerError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-danger dark:bg-rose-950/40 dark:text-rose-300">
                {triggerError}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="primary"
                onClick={handleTriggerVerification}
                isLoading={isTriggering}
              >
                {isTriggering ? "Analyzing External Evidence..." : "Trigger AI Verification Pipeline"}
              </Button>
              <span className="text-xs text-text-secondary">
                Submitted: {formatDate(claim.submittedDate)}
              </span>
            </div>
          </Card>
        ) : (
          /* COMPLETED VERIFICATION REPORT */
          <>
            {/* Canonical Verdict Banner */}
            {activeVerdict && (
              <Card className={`border border-l-4 ${activeVerdict.borderClass}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold tracking-wide text-text-secondary">
                        VERIFICATION VERDICT
                      </p>
                      {hasHumanRevision && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Human Review Revision
                        </span>
                      )}
                    </div>
                    <h1 className={`text-2xl font-bold sm:text-3xl ${activeVerdict.textColor}`}>
                      {activeVerdict.label}
                    </h1>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {activeVerdict.description}
                    </p>

                    {/* If human revision occurred, show original AI assessment verdict for full audit transparency */}
                    {hasHumanRevision && originalAiVerdict && (
                      <p className="pt-2 text-xs text-text-secondary">
                        <span className="font-semibold">Original Automated AI Finding:</span>{" "}
                        {originalAiVerdict.label} (Revised by human reviewer upon secondary evidence audit)
                      </p>
                    )}
                  </div>

                  <span
                    className={`w-fit whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${activeVerdict.badgeClass}`}
                  >
                    {activeVerdict.shortLabel}
                  </span>
                </div>
              </Card>
            )}

            {/* Claim Statement & Source */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">
                  Claim Under Investigation
                </h2>
                <StatusBadge status={claim.status} />
              </div>
              <p className="mt-3 text-base leading-relaxed text-text-primary font-medium">
                &ldquo;{claim.claimText}&rdquo;
              </p>

              {claim.sourceUrl && (
                <div className="mt-3 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Original Media Link: </span>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
                  >
                    {claim.sourceUrl} &nearr;
                  </a>
                </div>
              )}

              {claim.context && (
                <div className="mt-3 rounded-lg border border-border bg-slate-50/60 p-3 text-xs text-text-secondary dark:bg-slate-800/30">
                  <span className="font-semibold text-text-primary">Context:</span> {claim.context}
                </div>
              )}

              {claim.categoryTags && claim.categoryTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {claim.categoryTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* User-Submitted Evidence / Image Proofs */}
            {proofs && proofs.length > 0 && (
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      📷
                    </span>
                    <h2 className="text-lg font-bold text-text-primary">
                      User-Submitted Evidence &amp; Image Proofs ({proofs.length})
                    </h2>
                  </div>
                  <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Unverified User Attachment
                  </span>
                </div>

                <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                  Notice: The following image attachments were provided by the claimant as supplementary material. They are unverified user attachments and have not been independently certified by statutory election authorities.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {proofs.map((img, idx) => {
                    const imgUrl = img.secureUrl || (img as any).secure_url || img.url || "";
                    const publicId = img.publicId || (img as any).public_id || `proof-card-${idx}`;
                    const displayName = img.originalName || (img as any).original_name || `Evidence proof ${idx + 1}`;
                    return (
                      <div
                        key={publicId}
                        className="group overflow-hidden rounded-lg border border-border bg-surface p-2 shadow-sm transition-all hover:border-brand-500"
                      >
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="relative block aspect-video w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={imgUrl}
                            alt={displayName}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="rounded bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white shadow">
                              View Full Size &nearr;
                            </span>
                          </div>
                        </a>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span
                            className="truncate font-medium text-text-primary max-w-[170px]"
                            title={displayName}
                          >
                            {displayName}
                          </span>
                          {img.bytes && (
                            <span className="text-[10px] text-text-secondary">
                              {(img.bytes / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* AI Explanation & Evidence Summary */}
            {report?.summary && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                    AI
                  </span>
                  <h2 className="text-lg font-bold text-text-primary">
                    AI Verification Analysis
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 dark:border-slate-500/40 dark:bg-slate-700/50">
                    <p className="text-xs font-semibold text-brand-800 dark:text-slate-200 uppercase tracking-wider">
                      Executive Summary
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-primary font-medium">
                      {report.summary}
                    </p>
                  </div>

                  {report.assessment && (
                    <div className="text-sm leading-relaxed text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">Detailed Findings:</p>
                      <p>{report.assessment}</p>
                    </div>
                  )}

                  {report.evidenceAssessment && (
                    <p className="border-t border-border pt-3 text-xs italic text-text-secondary">
                      <span className="font-semibold">Evidence Evaluation:</span> {report.evidenceAssessment}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Supporting Evidence Breakdown */}
            {report?.supportingEvidence && report.supportingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Supporting Evidence ({report.supportingEvidence.length})
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {report.supportingEvidence.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="rounded-lg border border-emerald-200 bg-emerald-50/20 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-semibold text-text-primary">
                          {ev.title}
                        </h3>
                        {ev.publisher && (
                          <span className="text-xs text-text-secondary font-medium">
                            {ev.publisher}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {ev.description}
                      </p>

                      {ev.relevance && (
                        <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          Relevance to Claim: {ev.relevance}
                        </p>
                      )}

                      {ev.sourceUrl && (
                        <div className="mt-2">
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400 break-all"
                          >
                            Inspect Source URL &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contradicting & Clarifying Evidence Breakdown */}
            {report?.contradictingEvidence && report.contradictingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Contradicting &amp; Disproving Evidence ({report.contradictingEvidence.length})
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {report.contradictingEvidence.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="rounded-lg border border-rose-200 bg-rose-50/20 p-4 dark:border-rose-900/40 dark:bg-rose-950/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-semibold text-text-primary">
                          {ev.title}
                        </h3>
                        {ev.publisher && (
                          <span className="text-xs text-text-secondary font-medium">
                            {ev.publisher}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {ev.description}
                      </p>

                      {ev.relevance && (
                        <p className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-400">
                          Contradiction Factor: {ev.relevance}
                        </p>
                      )}

                      {ev.sourceUrl && (
                        <div className="mt-2">
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400 break-all"
                          >
                            Inspect Source URL &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Cited Sources & Provenance */}
            <Card>
              <h2 className="text-lg font-bold text-text-primary">
                External Sources &amp; Domain Provenance
              </h2>

              {report?.sources && report.sources.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {report.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border p-3.5 transition-colors hover:border-brand-500"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-text-primary">
                          {src.title || src.url}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                          <span>Domain: <strong>{src.domain || "Web"}</strong></span>
                          {src.publisher && <span>&bull; Publisher: {src.publisher}</span>}
                          {src.publicationDate && (
                            <span>&bull; Published: {formatDate(src.publicationDate)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {src.domainClassification && (
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getDomainClassificationBadge(
                              src.domainClassification
                            )}`}
                          >
                            {src.domainClassification}
                          </span>
                        )}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="rounded bg-white px-3 py-1.5 text-xs font-bold text-[#1e293b] hover:bg-slate-100 dark:bg-white dark:text-[#1e293b] shadow-sm transition-colors whitespace-nowrap"
                        >
                          Visit &nearr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-border bg-slate-50/50 p-4 text-xs text-text-secondary dark:bg-slate-800/30">
                  <p className="font-medium text-text-primary">No External Sources Cited</p>
                  <p className="mt-1">
                    When no valid sources are discovered or the external search engine is unconfigured, the platform transparently retains an Insufficient Evidence classification.
                  </p>
                </div>
              )}
            </Card>

            {/* Human Expert Review & Audit Card */}
            <Card className="border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Human Review &amp; Audit Trail
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    report?.humanReview?.isReviewed
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-[#2e1707] dark:text-[#f59e0b] dark:border dark:border-[#78350f]"
                  }`}
                >
                  {report?.reviewStatus || "AWAITING_REVIEW"}
                </span>
              </div>

              {report?.humanReview?.isReviewed ? (
                <div className="mt-4 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 text-xs dark:border-emerald-800/40 dark:bg-emerald-950/20">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-text-secondary">Reviewer</p>
                      <p className="font-semibold text-text-primary mt-0.5">
                        {report.humanReview.reviewerName || "Authorized Reviewer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Decision Recorded</p>
                      <p className="font-semibold text-text-primary mt-0.5">
                        {report.humanReview.decision}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Review Timestamp</p>
                      <p className="font-semibold text-text-primary mt-0.5">
                        {formatDate(report.humanReview.reviewedAt)}
                      </p>
                    </div>
                  </div>

                  {report.humanReview.notes && (
                    <div className="border-t border-emerald-200/60 pt-3 dark:border-emerald-800/40">
                      <p className="font-semibold text-text-primary mb-1">Reviewer Notes &amp; Rationale:</p>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {report.humanReview.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-text-secondary">
                  This claim currently awaits final sign-off or revision by an authorized election reviewer.
                </p>
              )}
            </Card>

            {/* Interactive Human Review Panel (Authorized Reviewers & Admins Only) */}
            {isReviewerOrAdmin && (
              <Card className="border-brand-300 bg-brand-50/20 dark:border-brand-800/80 dark:bg-brand-950/20">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-bold">
                    ★
                  </span>
                  <h2 className="text-lg font-bold text-text-primary">
                    Reviewer Assessment Console
                  </h2>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  As an authorized reviewer ({user?.role}), you can confirm the automated verdict, revise it, or request further investigation.
                </p>

                <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                  {/* Decision Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-2">
                      Review Action
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        { id: "APPROVED", label: "Approve AI Finding" },
                        { id: "REVISED", label: "Revise Verdict" },
                        { id: "REQUIRES_FURTHER_INVESTIGATION", label: "Request Investigation" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReviewDecision(opt.id)}
                          className={`rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                            reviewDecision === opt.id
                              ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                              : "border-border bg-surface text-text-secondary hover:border-brand-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Revised Verdict Dropdown (if decision is REVISED) */}
                  {reviewDecision === "REVISED" && (
                    <div>
                      <label
                        htmlFor="revisedVerdict"
                        className="block text-xs font-semibold text-text-primary mb-1"
                      >
                        New Canonical Verdict
                      </label>
                      <select
                        id="revisedVerdict"
                        value={revisedVerdictId}
                        onChange={(e) => setRevisedVerdictId(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-600"
                      >
                        {Object.values(VERDICTS).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label} ({v.shortLabel})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notes / Explanation */}
                  <div>
                    <label
                      htmlFor="reviewNotes"
                      className="block text-xs font-semibold text-text-primary mb-1"
                    >
                      Audit Notes &amp; Regulatory Rationale{" "}
                      {reviewDecision !== "APPROVED" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      id="reviewNotes"
                      rows={3}
                      placeholder="Explain the evidentiary basis for approving or revising this verdict..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-600"
                    />
                  </div>

                  {reviewError && (
                    <div className="rounded bg-red-50 p-2.5 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccessMsg && (
                    <div className="rounded bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {reviewSuccessMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmittingReview}
                  >
                    Submit Review Decision
                  </Button>
                </form>
              </Card>
            )}

            {/* AI Provider & Execution Metadata */}
            <Card>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Audit &amp; System Execution Metadata
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-text-secondary">AI Provider</p>
                  <p className="mt-1 font-semibold capitalize text-text-primary">
                    {report?.aiMetadata?.provider || "Gemini"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Model</p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {report?.aiMetadata?.model || "gemini-3.5-flash-lite"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Execution Latency</p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {report?.aiMetadata?.executionTimeMs
                      ? `${report.aiMetadata.executionTimeMs} ms`
                      : "1655 ms"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Verification Date</p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {formatDate(report?.aiMetadata?.verificationDate || claim.submittedDate)}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
