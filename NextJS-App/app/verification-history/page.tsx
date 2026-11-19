"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import Button from "@/components/Button";
import VerdictBadge from "@/components/VerdictBadge";
import StatusBadge from "@/components/StatusBadge";
import OfflineNotice from "@/components/OfflineNotice";
import { VERDICT_LIST } from "@/constants/verdicts";
import { claimsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ClaimItem, ClaimStats } from "@/types";

export default function VerificationHistoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVerdict, setSelectedVerdict] = useState("ALL");
  const [viewScope, setViewScope] = useState<"all" | "mine">("all");
  const [page, setPage] = useState(1);

  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, statsData] = await Promise.all([
        claimsApi.getClaims({
          page,
          limit: 10,
          searchTerm,
          status: selectedStatus,
          verdictId: selectedVerdict,
          mine: viewScope === "mine",
        }),
        claimsApi.getClaimStats({ scope: viewScope === "mine" ? "user" : "platform" }),
      ]);

      setClaims(res.claims || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(statsData);
      if (res.isOffline) setIsOffline(true);
    } catch (err) {
      console.error("Failed to load claims history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedStatus, selectedVerdict, viewScope]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedVerdict("ALL");
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedStatus !== "ALL" || selectedVerdict !== "ALL";

  function formatDate(isoString: string) {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-text-primary">
            Verification History
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Inspect previous election claim submissions, check review statuses, and review findings.
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

          {isOffline && (
            <div className="mt-6">
              <OfflineNotice message="Backend server is unreachable. Displaying cached session records." />
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Total Tracked Claims
                </p>
                <h2 className="mt-2 text-3xl font-bold text-text-primary">
                  {stats.totalClaims}
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  All submitted statements
                </p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Completed Verifications
                </p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedVerifications}
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  Verified reports with findings
                </p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Under Review
                </p>
                <h2 className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.underReview}
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  Queued for investigation
                </p>
              </Card>
            </div>
          )}

          {/* Filters Card */}
          <div className="mt-8 card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <label htmlFor="search-history" className="sr-only">
                  Search claims
                </label>
                <input
                  id="search-history"
                  type="text"
                  placeholder="Search keywords in claims..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
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

                <select
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

          {/* Claims List */}
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <div className="card text-center p-12 text-sm text-text-secondary">
                Loading verification records...
              </div>
            ) : claims.length > 0 ? (
              claims.map((record) => (
                <Card key={record.id || record._id} hoverable className="transition-all">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/verification-result/${record.id || record._id}`}
                          className="font-semibold text-sm text-text-primary hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {record.title}
                        </Link>
                      </div>

                      <p className="line-clamp-2 text-xs text-text-secondary">
                        {record.claimText}
                      </p>

                      <div className="flex gap-4 text-xs text-text-secondary">
                        <span>Submitted {formatDate(record.submittedDate)}</span>
                        <span>Language: {record.language}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <StatusBadge status={record.status} />
                      {record.verdictId && <VerdictBadge verdictId={record.verdictId} />}
                      <Link
                        href={`/verification-result/${record.id || record._id}`}
                        className="whitespace-nowrap text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        View Results &rarr;
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="card text-center p-12">
                <p className="font-semibold text-text-primary">
                  No matching claims found
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Try adjusting your search keywords or filter selections.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous
              </Button>
              <span className="text-xs text-text-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
