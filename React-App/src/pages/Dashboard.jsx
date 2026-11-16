import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import OfflineNotice from "../components/OfflineNotice";
import StatusBadge from "../components/StatusBadge";
import { getClaimStats, getClaims } from "../services/claimService.js";
import { getVerdictById } from "../constants/verdicts.js";

/**
 * ElectionVerify AI - Dashboard Page
 *
 * Overview of verification metrics and recent claim activity powered by
 * the Shared-Backend API with seamless offline demo fallback.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [statsData, claimsData] = await Promise.all([
          getClaimStats(),
          getClaims({ limit: 4 }),
        ]);

        if (isMounted) {
          setStats(statsData);
          setRecentClaims(claimsData.claims || []);
          if (statsData.isOffline || claimsData.isOffline) {
            setIsOffline(true);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  function formatDisplayDate(isoString) {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            OVERVIEW
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Verification Dashboard
          </h1>
          <p className="mt-2 text-text-secondary">
            Monitor election claim verification activity, evidence assessments, and review statuses.
          </p>
        </div>

        {/* Offline Demo Notice if server is unreachable */}
        {isOffline ? (
          <OfflineNotice message="Backend server is unreachable. Displaying baseline demonstration fixtures and local session submissions." />
        ) : (
          <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="font-semibold">Connected:</span> Live verification data connected to ElectionVerify Shared-Backend API.
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Total Claims Checked
              </p>
              <h2 className="mt-3 text-3xl font-bold">{stats.totalClaims}</h2>
              <p className="mt-2 text-sm text-text-secondary">
                All tracked submissions
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Supported
              </p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.byVerdict?.SUPPORTED ?? 0}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Supported by evidence
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Contradicted
              </p>
              <h2 className="mt-3 text-3xl font-bold text-rose-600 dark:text-rose-400">
                {stats.byVerdict?.CONTRADICTED ?? 0}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Contradicted by evidence
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Under Review
              </p>
              <h2 className="mt-3 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {stats.underReview}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Awaiting review pipeline
              </p>
            </Card>
          </div>
        )}

        {/* Quick Action Banner */}
        <div className="mt-8 card flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Verify an Election Claim</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Have an election-related statement to investigate? Submit it for evidence retrieval and analysis.
            </p>
          </div>
          <Button
            onClick={() => navigate("/submit-claim")}
            className="whitespace-nowrap"
          >
            + Verify a Claim
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Claims</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Latest claims processed or under review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/verification-history")}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {recentClaims.length > 0 ? (
              recentClaims.map((claim) => {
                const verdict = claim.verdictId ? getVerdictById(claim.verdictId) : null;
                const isUnderReview =
                  claim.status === "UNDER_REVIEW" || claim.status === "IN_VERIFICATION";

                return (
                  <Card key={claim.id} hoverable className="transition-all">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <Link
                          to={`/verification-result/${claim.id}`}
                          className="font-semibold text-text-primary hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {claim.title}
                        </Link>
                        <p className="text-xs text-text-secondary">
                          Submitted on {formatDisplayDate(claim.submittedDate)} &bull; Language: {claim.language}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {isUnderReview ? (
                          <StatusBadge status={claim.status} />
                        ) : verdict ? (
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${verdict.badgeClass}`}
                          >
                            {verdict.shortLabel}
                          </span>
                        ) : (
                          <StatusBadge status={claim.status || "COMPLETED"} />
                        )}

                        <Link
                          to={`/verification-result/${claim.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          aria-label={`View report for ${claim.title}`}
                        >
                          View Report &rarr;
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <p className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-secondary">
                No recent claim submissions found.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
