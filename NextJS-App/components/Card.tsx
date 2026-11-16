import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  as: Component = "div",
  hoverable = false,
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
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
      className={`rounded-xl border border-border bg-surface ${paddings[padding]} shadow-sm ${hoverStyles} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Card;
