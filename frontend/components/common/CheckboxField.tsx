"use client";

/**
 * Checkbox with a label and optional helper text.
 * Used for Terms acceptance and every consent preference. Consent checkboxes
 * default to UNCHECKED — nothing marketing-related is pre-enabled.
 */
import { useId } from "react";

import styles from "./CheckboxField.module.css";

type CheckboxFieldProps = {
  label: React.ReactNode;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
};

export default function CheckboxField({
  label,
  name,
  checked,
  onChange,
  helperText,
  error,
  disabled = false,
}: CheckboxFieldProps) {
  const reactId = useId();
  const fieldId = `${name}-${reactId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <div className={styles.row}>
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        <div className={styles.labelBlock}>
          <label className={styles.label} htmlFor={fieldId}>
            {label}
          </label>
          {helperText ? (
            <p className={styles.helper} id={helperId}>
              {helperText}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
