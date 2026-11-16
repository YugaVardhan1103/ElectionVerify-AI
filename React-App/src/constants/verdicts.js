/**
 * ElectionVerify AI - Official Verdict Definitions
 *
 * This file centralizes the 5 official verification verdict categories used across
 * the platform (Dashboard, Verification History, Verification Results, and Filters).
 *
 * NOTE: Lifecycle/processing states like "Under Review", "Pending", or "Processing"
 * are claim processing statuses, NOT verification verdicts. They are kept separate
 * from these official verdict categories.
 *
 * Each verdict includes:
 * - id: Unique identifier
 * - label: Official full display label
 * - shortLabel: Compact label for badges and filters
 * - description: User-facing explanation of what the verdict means
 * - textColor: Theme-aware text color class (light & dark mode compatible)
 * - badgeClass: Theme-aware badge styles (light & dark mode compatible)
 * - borderClass: Theme-aware accent border class
 * - dotClass: Theme-aware status indicator dot
 */

export const VERDICTS = Object.freeze({
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
});

/**
 * Array of all verdicts in display order.
 * Useful for mapping options in dropdowns and filter bars.
 */
export const VERDICT_LIST = Object.freeze(Object.values(VERDICTS));

/**
 * Safely look up a verdict by its ID, case-insensitively.
 * Returns null if the ID is missing, unknown, or not an own property of VERDICTS.
 *
 * @param {string} id - The verdict ID (e.g. "SUPPORTED", "supported")
 * @returns {object|null} The matching verdict definition or null
 */
export function getVerdictById(id) {
  if (!id || typeof id !== "string") {
    return null;
  }
  const normalized = id.trim().toUpperCase();
  return Object.hasOwn(VERDICTS, normalized) ? VERDICTS[normalized] : null;
}

/**
 * Resolve a verdict from legacy or friendly string names.
 * Returns null for unrecognized statuses, preserving the distinction
 * between actual verdicts and other statuses (such as "Under Review").
 *
 * @param {string} statusOrLabel - e.g. "Supported", "Contradicted", "Partially Supported"
 * @returns {object|null} The matching verdict definition or null
 */
export function resolveVerdict(statusOrLabel) {
  if (!statusOrLabel || typeof statusOrLabel !== "string") {
    return null;
  }

  const query = statusOrLabel.trim().toLowerCase();

  const found = VERDICT_LIST.find(
    (v) =>
      v.id.toLowerCase() === query ||
      v.label.toLowerCase() === query ||
      v.shortLabel.toLowerCase() === query
  );

  return found || null;
}

export default VERDICTS;
