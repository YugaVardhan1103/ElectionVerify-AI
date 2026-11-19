import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import OfflineNotice from "../components/OfflineNotice";
import { useAuth } from "../context/useAuth.js";
import { getClaims, getClaimStats } from "../services/claimService.js";
import { VERDICT_LIST, getVerdictById } from "../constants/verdicts.js";

/**
 * ElectionVerify AI - Verification History Page
 *
 * Displays a searchable, filterable log of past claim submissions and records.
 * Integrates directly with the Shared-Backend API with seamless offline fallback.
 */
function VerificationHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVerdict, setSelectedVerdict] = useState("ALL");
  const [viewScope, setViewScope] = useState("all");
  const [page, setPage] = useState(1);

  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [res, statsData] = await Promise.all([
          getClaims({
            page,
            limit: 10,
            searchTerm,
            status: selectedStatus,
            verdictId: selectedVerdict,
            mine: viewScope === "mine",
          }),
          getClaimStats({ scope: viewScope === "mine" ? "user" : "platform" }),
        ]);

        if (!isMounted) return;
        setClaims(res.claims || []);
        setPagination(
          res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
        );
        setStats(statsData);
        if (res.isOffline) {
          setIsOffline(true);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load claims history:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [page, searchTerm, selectedStatus, selectedVerdict, viewScope]);

  function formatDate(isoString) {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function handleClearFilters() {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedVerdict("ALL");
    setPage(1);
  }

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedVerdict !== "ALL";

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Verification History</h1>
        <p className="mt-2 text-text-secondary">
          Track and inspect past claim submissions, review statuses, and verified records.
        </p>

        {user && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => { setViewScope("all"); setPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                viewScope === "all"
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "border border-border bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              Public Claims & Registry
            </button>
            <button
              type="button"
              onClick={() => { setViewScope("mine"); setPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                viewScope === "mine"
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "border border-border bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              My Submissions
            </button>
          </div>
        )}

        {/* Offline Notice if server is unreachable */}
        {isOffline ? (
          <div className="mt-6">
            <OfflineNotice message="Backend server is unreachable. Displaying cached verification records." />
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="font-semibold">Connected:</span> Connected to Shared-Backend API for historical verification records.
          </div>
        )}

        {/* History Statistics */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Total Tracked Claims
              </p>
              <h2 className="mt-3 text-3xl font-bold">{stats.totalClaims}</h2>
              <p className="mt-2 text-sm text-text-secondary">
                All platform submissions
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-text-secondary">
                Completed Reports
              </p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completedVerifications}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Verification reports available
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
                Pending review pipeline
              </p>
            </Card>
          </div>
        )}

        {/* Search & Filters Bar */}
        <div className="mt-10 card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search-claims" className="sr-only">
                Search claims
              </label>
              <input
                id="search-claims"
                type="text"
                placeholder="Search by keywords in title or claim statement..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="sr-only">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="IN_VERIFICATION">In Verification</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Verdict Filter */}
              <div>
                <label htmlFor="verdict-filter" className="sr-only">
                  Filter by verdict
                </label>
                <select
                  id="verdict-filter"
                  value={selectedVerdict}
                  onChange={(e) => {
                    setSelectedVerdict(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="ALL">All Verdicts</option>
                  {VERDICT_LIST.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.shortLabel}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Claim Records List */}
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
          ) : claims.length > 0 ? (
            claims.map((record) => {
              const verdict = record.verdictId
                ? getVerdictById(record.verdictId)
                : null;
              const isUnderReview =
                record.status === "UNDER_REVIEW" ||
                record.status === "IN_VERIFICATION";

              return (
                <Card key={record.id} hoverable className="transition-all">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/verification-result/${record.id}`}
                          className="font-semibold text-text-primary hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {record.title}
                        </Link>
                      </div>

                      <p className="line-clamp-2 text-xs text-text-secondary">
                        {record.claimText}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                        <span>Submitted {formatDate(record.submittedDate)}</span>
                        <span>Language: {record.language}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      {isUnderReview ? (
                        <StatusBadge status={record.status} />
                      ) : verdict ? (
                        <span
                          className={`w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${verdict.badgeClass}`}
                        >
                          {verdict.shortLabel}
                        </span>
                      ) : (
                        <StatusBadge status={record.status || "COMPLETED"} />
                      )}

                      <Link
                        to={`/verification-result/${record.id}`}
                        className="whitespace-nowrap text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        View Results &rarr;
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <p className="text-base font-medium text-text-primary">
                No matching verification records found
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Try modifying your search term or filter criteria.
              </p>
              {hasActiveFilters && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-text-secondary">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} claims total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default VerificationHistory;
