import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { getPendingReviews } from "../services/claimService.js";
import { getVerdictById } from "../constants/verdicts.js";

/**
 * ElectionVerify AI - Reviewer Queue Page
 *
 * Dedicated triage and audit console for authorized reviewers and admins.
 */
function ReviewerQueue() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadQueue() {
      try {
        const res = await getPendingReviews({
          page: pagination.page,
          limit: 20,
          reviewStatus: selectedFilter,
        });

        if (!isMounted) return;
        if (res.success) {
          setClaims(res.claims || []);
          setPagination(
            res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 }
          );
        } else {
          setError(res.error || "Failed to load pending reviews.");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "An unexpected error occurred.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQueue();
    return () => {
      isMounted = false;
    };
  }, [pagination.page, selectedFilter]);

  function formatDate(isoString) {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Recent";
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
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                Reviewer Triage Queue
              </h1>
              <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-800 dark:bg-brand-950/80 dark:text-brand-300">
                Staff Only
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Review and sign off on automated AI election verification assessments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filterStatus" className="text-xs font-semibold text-text-secondary">
              Filter:
            </label>
            <select
              id="filterStatus"
              value={selectedFilter}
              onChange={(e) => {
                setIsLoading(true);
                setSelectedFilter(e.target.value);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary outline-none focus:border-brand-600"
            >
              <option value="ALL">All Pending ({pagination.total})</option>
              <option value="AWAITING_REVIEW">Awaiting Initial Review</option>
              <option value="REQUIRES_FURTHER_INVESTIGATION">Requires Investigation</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-danger dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : claims.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              ✓
            </div>
            <h2 className="mt-4 text-lg font-bold text-text-primary">
              All Pending Claims Reviewed
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
              There are currently no claims pending human review. Check back later or inspect past verifications in history.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/verification-history")}
              >
                View Verification History
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const claimId = claim.id || claim._id;
              const verdict = claim.verdictId ? getVerdictById(claim.verdictId) : null;

              return (
                <Card
                  key={claimId}
                  className="transition-all hover:border-brand-500 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={claim.status} />

                        {claim.reviewStatus && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {claim.reviewStatus}
                          </span>
                        )}

                        {verdict && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${verdict.badgeClass}`}
                          >
                            AI: {verdict.shortLabel}
                          </span>
                        )}

                        {claim.imageProofs && claim.imageProofs.length > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            📷 {claim.imageProofs.length} proof{claim.imageProofs.length > 1 ? "s" : ""}
                          </span>
                        )}

                        <span className="text-xs text-text-secondary">
                          Submitted: {formatDate(claim.submittedDate)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary">
                        {claim.title}
                      </h3>

                      <p className="text-sm text-text-secondary line-clamp-2">
                        {claim.claimText}
                      </p>

                      {claim.sourceUrl && (
                        <p className="text-xs text-text-secondary">
                          Source:{" "}
                          <a
                            href={claim.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-brand-600 underline dark:text-brand-400"
                          >
                            {claim.sourceUrl}
                          </a>
                        </p>
                      )}

                      {claim.imageProofs && claim.imageProofs.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-text-secondary">Evidence Proofs:</span>
                          <div className="flex gap-1.5">
                            {claim.imageProofs.slice(0, 4).map((img, idx) => (
                              <img
                                key={img.publicId || idx}
                                src={img.secureUrl || img.url}
                                alt={img.originalName || "Evidence"}
                                className="h-9 w-9 rounded border border-border object-cover"
                              />
                            ))}
                            {claim.imageProofs.length > 4 && (
                              <span className="flex h-9 w-9 items-center justify-center rounded border border-border bg-slate-100 text-[10px] font-bold text-text-secondary dark:bg-slate-800">
                                +{claim.imageProofs.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/verification-result/${claimId}`)}
                      >
                        Audit &amp; Review &rarr;
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default ReviewerQueue;
