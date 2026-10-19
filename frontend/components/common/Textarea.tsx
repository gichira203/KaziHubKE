"use client";

/**
 * Textarea — multi-line counterpart to InputField, styled to match it
 * (same borders, focus ring and label conventions). Used by the job posting
 * form and company description fields.
 */
import { useId } from "react";
import { cx } from "@/lib/cx";

type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
};

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  rows = 4,
  disabled = false,
}: TextareaProps) {
  const reactId = useId();
  const fieldId = `${name}-${reactId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter((id): id is string => Boolean(id))
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13.5px] font-semibold leading-tight text-charcoal" htmlFor={fieldId}>
        {label}
        {required ? (
          <span className="ml-0.5 text-error" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>

      <div
        className={cx(
          "rounded-[0.625rem] border bg-white transition focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(0,138,46,0.15)]",
          error ? "border-error" : "border-line",
        )}
      >
        <textarea
          id={fieldId}
          name={name}
          rows={rows}
          className="block w-full resize-y bg-transparent px-3.5 py-2.5 text-[14px] leading-relaxed text-charcoal outline-none placeholder:text-muted-soft disabled:opacity-60"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          aria-required={required || undefined}
        />
      </div>

      {helperText ? (
        <p className="text-[12.5px] leading-normal text-muted" id={helperId}>
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p className="text-[12.5px] font-medium leading-normal text-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
