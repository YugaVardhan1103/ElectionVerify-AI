import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import OfflineNotice from "../components/OfflineNotice";
import { getVerificationReport } from "../services/claimService.js";
import { getVerdictById } from "../constants/verdicts.js";

/**
 * ElectionVerify AI - Verification Result Page
 *
 * Displays detailed verification findings for a specific claim.
 * Distinguishes between completed reports, claims currently under review,
 * human expert reviews, and unconfigured AI provider notices.
 */
function VerificationResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fallback to claim-001 if routed to /verification-result without an id
  const targetId = id || "claim-001";

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setIsLoading(true);
      try {
        const res = await getVerificationReport(targetId);
        if (isMounted) {
          setData(res);
          if (res.isOffline) {
            setIsOffline(true);
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

  function formatDate(isoString) {
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

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </main>
    );
  }

  // Not Found State
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
                onClick={() => navigate("/verification-history")}
              >
                Go to Verification History
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard")}
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
  const verdict = claim.verdictId ? getVerdictById(claim.verdictId) : null;
  const claimIdDisplay = claim.id || claim._id;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            to="/verification-history"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            &larr; Back to Verification History
          </Link>
          <span className="text-xs text-text-secondary">
            Claim ID: <code className="font-mono">{claimIdDisplay}</code>
          </span>
        </div>

        {/* Offline Notice if backend is down */}
        {isOffline && (
          <OfflineNotice message="Backend server is unreachable. Displaying local demonstration record." />
        )}

        {/* Prominent Verification Transparency Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-bold">Verification Transparency Protocol</p>
          <p className="mt-1">
            This verification record adheres to strict civic integrity standards.
            All evidence assessments and citations represent verifiable findings or transparent unconfigured notices.
            We never synthesize artificial citations or fake confidence scores.
          </p>
        </div>

        {/* UNDER REVIEW / IN VERIFICATION STATE */}
        {isUnderReview || claim.status === "UNDER_REVIEW" || claim.status === "IN_VERIFICATION" ? (
          <Card className="space-y-6 border-amber-200 bg-surface dark:border-amber-800/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
                  PROCESSING STATUS
                </p>
                <h1 className="mt-1 text-2xl font-bold text-text-primary">
                  {claim.status === "IN_VERIFICATION"
                    ? "Claim in Automated Verification Pipeline"
                    : "Claim Under Review"}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  This submission has been received into the ElectionVerify AI platform.
                  A conclusive verdict and evidence breakdown are currently being processed.
                </p>
              </div>

              <StatusBadge status={claim.status || "UNDER_REVIEW"} />
            </div>

            <div className="rounded-lg border border-border p-5">
              <h2 className="text-sm font-bold text-text-primary">
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
                <p className="text-text-secondary">Verification Pipeline</p>
                <p className="mt-1 font-semibold">Scheduled / Human Triage</p>
              </div>
            </div>
          </Card>
        ) : (
          /* COMPLETED VERIFICATION REPORT */
          <>
            {/* Verdict Card */}
            {verdict && (
              <Card className={`border-l-4 ${verdict.borderClass}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide text-text-secondary">
                      OFFICIAL VERIFICATION VERDICT
                    </p>
                    <h1 className={`text-2xl font-bold sm:text-3xl ${verdict.textColor}`}>
                      {verdict.label}
                    </h1>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {verdict.description}
                    </p>
                  </div>

                  <span
                    className={`w-fit whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${verdict.badgeClass}`}
                  >
                    {verdict.shortLabel}
                  </span>
                </div>
              </Card>
            )}

            {/* Claim Statement & Metadata */}
            <Card>
              <h2 className="text-lg font-bold text-text-primary">
                Claim Statement
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {claim.claimText}
              </p>

              {claim.sourceUrl && (
                <p className="mt-3 text-xs text-text-secondary">
                  <span className="font-medium">Original Source: </span>
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

            {/* Assessment Overview */}
            {report?.summary && (
              <Card>
                <h2 className="text-lg font-bold text-text-primary">
                  Assessment Overview
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {report.summary}
                </p>
                {report.assessment && (
                  <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-text-secondary">
                    {report.assessment}
                  </p>
                )}
                {report.evidenceAssessment && (
                  <p className="mt-3 text-xs italic text-text-secondary">
                    Evidence Note: {report.evidenceAssessment}
                  </p>
                )}
              </Card>
            )}

            {/* Supporting Evidence Cards */}
            {report?.supportingEvidence && report.supportingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Supporting Evidence
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {report.supportingEvidence.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="rounded-lg border border-border p-4 transition-colors"
                    >
                      <h3 className="font-semibold text-text-primary">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
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

            {/* Contradicting Evidence Cards */}
            {report?.contradictingEvidence && report.contradictingEvidence.length > 0 && (
              <Card>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Contradicting &amp; Clarifying Information
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {report.contradictingEvidence.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="rounded-lg border border-border p-4 transition-colors"
                    >
                      <h3 className="font-semibold text-text-primary">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
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
              <h2 className="text-lg font-bold text-text-primary">
                Cited Evidence Sources
              </h2>

              {report?.sources && report.sources.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {report.sources.map((src, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3">
                      <p className="font-medium">{src.title || src.url}</p>
                      {src.publisher && (
                        <p className="mt-1 text-xs text-text-secondary">
                          Publisher: {src.publisher}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-border bg-slate-50/50 p-4 text-xs text-text-secondary dark:bg-slate-800/30">
                  <p className="font-medium text-text-primary">No External Sources Cited</p>
                  <p className="mt-1">
                    No external citations are recorded for this record. In production, verified claims cite primary gazette notifications or authenticated election body releases.
                  </p>
                </div>
              )}
            </Card>

            {/* Human Expert Review Card if present */}
            {report?.humanReview?.isReviewed && (
              <Card className="border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Human Expert Review &amp; Audit
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {report.humanReview.notes}
                </p>
                <p className="mt-2 text-xs text-text-secondary">
                  Reviewed on: {formatDate(report.humanReview.reviewedAt)}
                </p>
              </Card>
            )}

            {/* AI Limitations Notice */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="font-bold">Human Oversight Advisory:</span> Automated verification and AI-assisted summaries serve an assistive purpose and must never replace official statutory proclamations from authorized election management bodies.
            </div>

            {/* Verification Metadata Details */}
            <Card>
              <h2 className="text-lg font-bold text-text-primary">
                Verification Details
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-text-secondary">Claim ID</p>
                  <p className="mt-1 font-mono font-medium">{claimIdDisplay}</p>
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

export default VerificationResult;
