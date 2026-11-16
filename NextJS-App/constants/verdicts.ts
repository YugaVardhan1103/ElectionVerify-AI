import { CanonicalVerdictId, VerdictDefinition } from "@/types";

export const VERDICTS: Record<CanonicalVerdictId, VerdictDefinition> = {
  SUPPORTED: {
    id: "SUPPORTED",
    label: "Supported by Evidence",
    shortLabel: "Supported",
    description:
      "Reliable evidence directly supports the core claims made in the statement.",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
    borderClass: "border-emerald-500",
    dotClass: "bg-emerald-500 dark:bg-emerald-400",
  },
  CONTRADICTED: {
    id: "CONTRADICTED",
    label: "Contradicted by Evidence",
    shortLabel: "Contradicted",
    description:
      "Reliable evidence directly contradicts the core claims made in the statement.",
    textColor: "text-rose-600 dark:text-rose-400",
    badgeClass:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
    borderClass: "border-rose-500",
    dotClass: "bg-rose-500 dark:bg-rose-400",
  },
  PARTIALLY_SUPPORTED: {
    id: "PARTIALLY_SUPPORTED",
    label: "Partially Supported",
    shortLabel: "Partially Supported",
    description:
      "The statement contains elements of truth, but some claims are unverified, exaggerated, or inaccurate.",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeClass:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    borderClass: "border-amber-500",
    dotClass: "bg-amber-500 dark:bg-amber-400",
  },
  MISLEADING_CONTEXT: {
    id: "MISLEADING_CONTEXT",
    label: "Misleading Context",
    shortLabel: "Misleading Context",
    description:
      "The information is factually real but presented without critical context, creating a false impression.",
    textColor: "text-orange-600 dark:text-orange-400",
    badgeClass:
      "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60",
    borderClass: "border-orange-500",
    dotClass: "bg-orange-500 dark:bg-orange-400",
  },
  INSUFFICIENT_EVIDENCE: {
    id: "INSUFFICIENT_EVIDENCE",
    label: "Insufficient Evidence",
    shortLabel: "Insufficient Evidence",
    description:
      "Available reliable evidence is insufficient to confirm or refute the claim definitively.",
    textColor: "text-slate-600 dark:text-slate-400",
    badgeClass:
      "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    borderClass: "border-slate-400 dark:border-slate-600",
    dotClass: "bg-slate-500 dark:bg-slate-400",
  },
};

export const VERDICT_LIST: VerdictDefinition[] = Object.values(VERDICTS);

export function getVerdictById(id: string | null | undefined): VerdictDefinition | null {
  if (!id) return null;
  const upper = id.toUpperCase() as CanonicalVerdictId;
  return VERDICTS[upper] || null;
}

export const SUPPORTED_LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Hindi", label: "Hindi" },
  { code: "Telugu", label: "Telugu" },
  { code: "Tamil", label: "Tamil" },
  { code: "Kannada", label: "Kannada" },
  { code: "Malayalam", label: "Malayalam" },
  { code: "Other", label: "Other" },
];
