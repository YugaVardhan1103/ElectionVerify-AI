"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import Button from "@/components/Button";
import VerdictBadge from "@/components/VerdictBadge";
import StatusBadge from "@/components/StatusBadge";
import OfflineNotice from "@/components/OfflineNotice";
import { claimsApi } from "@/lib/api";
import { ClaimItem, ClaimStats } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [recentClaims, setRecentClaims] = useState<ClaimItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, claimsData] = await Promise.all([
          claimsApi.getClaimStats(),
          claimsApi.getClaims({ limit: 4 }),
        ]);

        setStats(statsData);
        setRecentClaims(claimsData.claims || []);
        if (claimsData.isOffline) {
          setIsOffline(true);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

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
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400">
              OVERVIEW
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
              Verification Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Real-time summary of submitted election statements, canonical verdict distributions, and review statuses.
            </p>
          </div>

          {isOffline && (
            <OfflineNotice message="Backend API is unreachable. Displaying cached session records." />
          )}

          {/* Metric Cards */}
          {stats && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Total Claims Tracked
                </p>
                <h2 className="mt-2 text-3xl font-bold text-text-primary">
                  {stats.totalClaims}
                </h2>
                <p className="mt-1.5 text-xs text-text-secondary">
                  All recorded election statements
                </p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Supported by Evidence
                </p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.byVerdict?.SUPPORTED ?? 0}
                </h2>
                <p className="mt-1.5 text-xs text-text-secondary">
                  Confirmed through reliable records
                </p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Contradicted by Evidence
                </p>
                <h2 className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {stats.byVerdict?.CONTRADICTED ?? 0}
                </h2>
                <p className="mt-1.5 text-xs text-text-secondary">
                  Refuted by official sources
                </p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-text-secondary">
                  Under Review
                </p>
                <h2 className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.underReview}
                </h2>
                <p className="mt-1.5 text-xs text-text-secondary">
                  Queued for evidence investigation
                </p>
              </Card>
            </div>
          )}

          {/* Quick Action Banner */}
          <div className="mt-8 card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Verify an Election Claim
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                Have you encountered a questionable voting date, procedure, or registration rumor?
              </p>
            </div>
            <Button
              onClick={() => router.push("/submit-claim")}
              className="whitespace-nowrap"
            >
              + Submit a Claim
            </Button>
          </div>

          {/* Recent Claims List */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Recent Claim Submissions
                </h2>
                <p className="text-xs text-text-secondary">
                  Latest election statements submitted for investigation.
                </p>
              </div>

              <Link
                href="/verification-history"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View Complete History &rarr;
              </Link>
            </div>

            {isLoading ? (
              <div className="card text-center p-8 text-sm text-text-secondary">
                Loading claims...
              </div>
            ) : recentClaims.length > 0 ? (
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <Card key={claim.id || claim._id} hoverable className="transition-all">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <Link
                          href={`/verification-result/${claim.id || claim._id}`}
                          className="font-semibold text-sm text-text-primary hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {claim.title}
                        </Link>
                        <p className="text-xs text-text-secondary">
                          Submitted on {formatDate(claim.submittedDate)} &bull; Language: {claim.language}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={claim.status} />
                        {claim.verdictId && <VerdictBadge verdictId={claim.verdictId} />}
                        <Link
                          href={`/verification-result/${claim.id || claim._id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="card text-center p-8 text-sm text-text-secondary">
                No recent claim submissions found.
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
