import React, { useId } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  type = "text",
  name,
  id,
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  className = "",
  ...rest
}: FormInputProps) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const describedByIds: string[] = [];
  if (error) describedByIds.push(errorId);
  if (helperText) describedByIds.push(helperId);
  const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

  const borderStyles = error
    ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
    : "border-border focus:border-brand-600 focus:ring-brand-500/20";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={ariaDescribedBy}
        className={`w-full rounded-lg border bg-surface px-4 py-3 text-text-primary outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderStyles} ${className}`}
        {...rest}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default FormInput;
