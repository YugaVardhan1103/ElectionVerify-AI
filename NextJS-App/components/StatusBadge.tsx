import React from "react";
import { ClaimProcessingStatus } from "@/types";

interface StatusBadgeProps {
  status: ClaimProcessingStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "UNDER_REVIEW":
      return (
        <span
          className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300 ${className}`}
        >
          Under Review
        </span>
      );
    case "IN_VERIFICATION":
      return (
        <span
          className={`inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-300 ${className}`}
        >
          In Verification
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 ${className}`}
        >
          Completed
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}
        >
          Rejected
        </span>
      );
    default:
      return null;
  }
}

export default StatusBadge;
