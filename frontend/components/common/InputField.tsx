/**
 * Text input with label, helper text, inline error and an optional trailing slot
 * (used by PasswordField for the show/hide toggle).
 *
 * `errorId` links the field to its message for screen readers via
 * aria-describedby + aria-invalid.
 */
import { useId } from "react";
import { cx } from "@/lib/cx";
import styles from "./InputField.module.css";

type InputFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "password" | "url" | "number" | "date";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url";
  maxLength?: number;
  trailing?: React.ReactNode;
  disabled?: boolean;
};

export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  helperText,
  error,
  required = false,
  autoComplete,
  inputMode,
  maxLength,
  trailing,
  disabled = false,
}: InputFieldProps) {
  const reactId = useId();
  const fieldId = `${name}-${reactId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter((id): id is string => Boolean(id))
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
        <input
          id={fieldId}
          name={name}
          type={type}
          className={cx(styles.input, trailing ? styles.inputWithTrailing : null)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          aria-required={required || undefined}
        />
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
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
