import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import VerdictBadge from "@/components/VerdictBadge";
import StatusBadge from "@/components/StatusBadge";
import { claimsApi } from "@/lib/api";
import { getVerdictById } from "@/constants/verdicts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimResultPage({ params }: PageProps) {
  const { id } = await params;
  const claim = await claimsApi.getClaimById(id);

  if (!claim) {
    notFound();
  }

  const report = claim.verificationReport;
  const verdict = claim.verdictId ? getVerdictById(claim.verdictId) : null;
  const isUnderReview = claim.status === "UNDER_REVIEW";

  function formatDate(isoString: string) {
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

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/verification-history"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            &larr; Back to Verification History
          </Link>
          <span className="text-xs text-text-secondary">
            ID: <code className="font-mono">{claim.id || claim._id}</code>
          </span>
        </div>

        {/* Transparency Notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-bold">Verification Transparency Notice</p>
          <p className="mt-1">
            This verification record adheres to ElectionVerify AI ethical guidelines. All evidence cards, assessments, and citations represent authentic findings or transparent unconfigured notices. We never synthesize artificial citations or fake confidence percentages.
          </p>
        </div>

        {/* UNDER REVIEW STATE */}
        {isUnderReview ? (
          <Card className="space-y-6 border-amber-200 dark:border-amber-800/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
                  PROCESSING STATUS
                </p>
                <h1 className="mt-1 text-2xl font-bold text-text-primary">
                  Claim Under Review
                </h1>
                <p className="mt-1.5 text-xs text-text-secondary">
                  This submission has been queued for verification. A conclusive verdict and evidence breakdown are not yet available.
                </p>
              </div>

              <StatusBadge status="UNDER_REVIEW" />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Submitted Statement
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {claim.claimText}
              </p>

              {claim.sourceUrl && (
                <div className="mt-3 text-xs">
                  <span className="font-medium text-text-secondary">
                    Provided Source URL:{" "}
                  </span>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
                  >
                    {claim.sourceUrl}
                  </a>
                </div>
              )}

              {claim.context && (
                <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-text-secondary dark:bg-slate-800/40">
                  <span className="font-medium">Context Provided:</span>{" "}
                  {claim.context}
                </div>
              )}

              {claim.imageProofs && claim.imageProofs.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      User-Submitted Image Proofs ({claim.imageProofs.length})
                    </p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Unverified User Attachment
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Supplementary images submitted with this claim. Unverified by election authorities.
                  </p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {claim.imageProofs.map((img, idx) => (
                      <a
                        key={img.publicId || idx}
                        href={img.secureUrl || img.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-slate-100 hover:border-brand-500 dark:bg-slate-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.secureUrl || img.url}
                          alt={img.originalName || `Evidence ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-white">View &nearr;</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div>
                <p className="text-text-secondary">Submission Date</p>
                <p className="mt-1 font-semibold">{formatDate(claim.submittedDate)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Language</p>
                <p className="mt-1 font-semibold">{claim.language}</p>
              </div>
              <div>
                <p className="text-text-secondary">Review Pipeline</p>
                <p className="mt-1 font-semibold">Triage Scheduled</p>
              </div>
            </div>
          </Card>
        ) : (
          /* COMPLETED VERIFICATION REPORT */
          <>
            {/* Verdict Hero Card */}
            {verdict && (
              <Card className={`border-l-4 ${verdict.borderClass}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                      Official Verification Verdict
                    </p>
                    <h1 className={`text-2xl font-bold sm:text-3xl ${verdict.textColor}`}>
                      {verdict.label}
                    </h1>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {verdict.description}
                    </p>
                  </div>

                  <VerdictBadge verdictId={verdict.id} />
                </div>
              </Card>
            )}

            {/* Claim Statement */}
            <Card>
              <h2 className="text-base font-bold text-text-primary">
                Claim Statement
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {claim.claimText}
              </p>

              {claim.sourceUrl && (
                <p className="mt-3 text-xs text-text-secondary">
                  <span className="font-medium">Original Source Link: </span>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-brand-600 underline dark:text-brand-400"
                  >
                    {claim.sourceUrl}
                  </a>
                </p>
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
            {claim.imageProofs && claim.imageProofs.length > 0 && (
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      📷
                    </span>
                    <h2 className="text-base font-bold text-text-primary">
                      User-Submitted Evidence &amp; Image Proofs ({claim.imageProofs.length})
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
                  {claim.imageProofs.map((img, idx) => (
                    <div
                      key={img.publicId || idx}
                      className="group overflow-hidden rounded-lg border border-border bg-surface p-2 shadow-sm transition-all hover:border-brand-500"
                    >
                      <a
                        href={img.secureUrl || img.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="relative block aspect-video w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.secureUrl || img.url}
                          alt={img.originalName || `Evidence proof ${idx + 1}`}
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
                          title={img.originalName}
                        >
                          {img.originalName || `Evidence ${idx + 1}`}
                        </span>
                        {img.bytes && (
                          <span className="text-[10px] text-text-secondary">
                            {(img.bytes / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Assessment & Analysis */}
            {report?.summary && (
              <Card>
                <h2 className="text-base font-bold text-text-primary">
                  Assessment Overview
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {report.summary}
                </p>
                {report.assessment && (
                  <p className="mt-3 text-xs leading-relaxed text-text-secondary border-t border-border pt-3">
                    {report.assessment}
                  </p>
                )}
              </Card>
            )}

            {/* Supporting Evidence */}
            {report?.supportingEvidence && report.supportingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <h2 className="text-base font-bold text-text-primary">
                    Supporting Evidence
                  </h2>
                </div>

                <div className="mt-3 space-y-3">
                  {report.supportingEvidence.map((ev, idx) => (
                    <div key={ev.id || idx} className="rounded-lg border border-border p-3.5">
                      <h3 className="font-semibold text-sm text-text-primary">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {ev.description}
                      </p>
                      {ev.relevance && (
                        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Relevance: {ev.relevance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contradicting Evidence */}
            {report?.contradictingEvidence && report.contradictingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
                  <h2 className="text-base font-bold text-text-primary">
                    Contradicting &amp; Clarifying Evidence
                  </h2>
                </div>

                <div className="mt-3 space-y-3">
                  {report.contradictingEvidence.map((ev, idx) => (
                    <div key={ev.id || idx} className="rounded-lg border border-border p-3.5">
                      <h3 className="font-semibold text-sm text-text-primary">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {ev.description}
                      </p>
                      {ev.relevance && (
                        <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                          Relevance: {ev.relevance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Cited Sources */}
            <Card>
              <h2 className="text-base font-bold text-text-primary">
                Cited Evidence Sources
              </h2>

              {report?.sources && report.sources.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {report.sources.map((src, idx) => (
                    <div key={idx} className="rounded border border-border p-3 text-xs">
                      <p className="font-medium">{src.title || src.url}</p>
                      <p className="text-text-secondary mt-1">{src.publisher}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-border bg-slate-50/50 p-4 text-xs text-text-secondary dark:bg-slate-800/30">
                  <p className="font-medium text-text-primary">No External Sources Cited</p>
                  <p className="mt-1">
                    No external citations are recorded for this record. In production, verified claims cite primary gazette notifications or authenticated election body releases.
                  </p>
                </div>
              )}
            </Card>

            {/* Human Review Notes if available */}
            {report?.humanReview?.isReviewed && (
              <Card className="border-emerald-200 dark:border-emerald-800/60">
                <h2 className="text-base font-bold text-text-primary">
                  Human Expert Review
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {report.humanReview.notes}
                </p>
                <p className="mt-2 text-[11px] text-text-secondary">
                  Reviewed on: {formatDate(report.humanReview.reviewedAt || "")}
                </p>
              </Card>
            )}

            {/* AI Limitations Notice */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="font-bold">Human Oversight Advisory:</span> Automated analysis serves an assistive purpose and must never replace official statutory proclamations from authorized election management bodies.
            </div>

            {/* Metadata Footer */}
            <Card>
              <h2 className="text-base font-bold text-text-primary">
                Verification Details
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-text-secondary">Claim ID</p>
                  <p className="mt-1 font-mono font-medium">{claim.id || claim._id}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Submitted Date</p>
                  <p className="mt-1 font-medium">{formatDate(claim.submittedDate)}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Language</p>
                  <p className="mt-1 font-medium">{claim.language}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Status</p>
                  <p className="mt-1 font-medium">{claim.status}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
