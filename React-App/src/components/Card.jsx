/**
 * ElectionVerify AI - Reusable Card Component
 *
 * Supports:
 * - Semantic HTML customization via `as` prop (e.g. section, article, div)
 * - Subtle hover elevation effect via `hoverable` prop (independent of clickability)
 * - Padding variants (none, sm, md, lg)
 * - Accessible passthrough props
 */
function Card({
  children,
  as: Component = "div",
  hoverable = false,
  padding = "md",
  className = "",
  ...rest
}) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hoverable
    ? "transition-shadow duration-200 hover:shadow-md"
    : "";

  return (
    <Component
      className={`rounded-xl border border-border bg-surface ${paddings[padding] || paddings.md} shadow-sm ${hoverStyles} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Card;
