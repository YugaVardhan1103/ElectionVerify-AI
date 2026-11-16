import React from "react";
import { getVerdictById } from "@/constants/verdicts";

interface VerdictBadgeProps {
  verdictId: string | null | undefined;
  className?: string;
}

export function VerdictBadge({ verdictId, className = "" }: VerdictBadgeProps) {
  const verdict = getVerdictById(verdictId);
  if (!verdict) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${verdict.badgeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${verdict.dotClass}`} aria-hidden="true" />
      {verdict.shortLabel}
    </span>
  );
}

export default VerdictBadge;
