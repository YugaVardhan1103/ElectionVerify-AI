/**
 * ElectionVerify AI - Reusable Button Component
 *
 * Supports:
 * - Variants: primary, secondary, outline, danger, ghost
 * - Sizes: sm, md, lg
 * - States: disabled, isLoading
 * - Accessible focus rings & ARIA attributes
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  isLoading = false,
  className = "",
  ...rest
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 select-none";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-lg gap-2.5",
  };

  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm",
    secondary:
      "border border-border bg-surface text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm",
    outline:
      "border border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    ghost:
      "text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60",
  };

  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isButtonDisabled}
      aria-busy={isLoading ? "true" : undefined}
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
