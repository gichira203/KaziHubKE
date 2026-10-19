"use client";

/**
 * Select input with label, helper text and inline error.
 * Used for single-choice dropdowns (county, country, industry, sizes, years).
 */
import { useId } from "react";
import { cx } from "@/lib/cx";
import styles from "./SelectField.module.css";

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
};

export default function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  helperText,
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  const reactId = useId();
  const fieldId = `${name}-${reactId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}> (optional)</span>
        )}
      </label>

      <div className={cx(styles.inputWrap, error && styles.inputWrapError)}>
        <select
          id={fieldId}
          name={name}
          className={styles.select}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          aria-required={required || undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </div>

      {helperText ? (
        <p className={styles.helper} id={helperId}>
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
