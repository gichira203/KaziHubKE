"use client";

/**
 * Password input with show/hide toggle and an optional strength meter.
 * The toggle is a real button (keyboard accessible) with a correct aria-label.
 */
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import InputField from "./InputField";
import { assessPassword, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import styles from "./PasswordField.module.css";

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  autoComplete?: "new-password" | "current-password";
  showStrength?: boolean;
  required?: boolean;
};

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = "••••••••",
  helperText,
  error,
  autoComplete = "new-password",
  showStrength = false,
  required = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const strength = assessPassword(value);

  return (
    <div>
      <InputField
        label={label}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        autoComplete={autoComplete}
        required={required}
        trailing={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        }
      />

      {showStrength ? (
        <div className={styles.strength} aria-live="polite">
          <div className={styles.meterRow}>
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`${styles.meterSeg} ${
                  strength.score >= step ? styles[`meter${strength.level}`] : ""
                }`}
              />
            ))}
          </div>
          <p className={styles.strengthLabel} id={`${name}-${reactId}-strength`}>
            Password strength: <strong>{strength.label}</strong>
          </p>

          {strength.missing.length > 0 ? (
            <ul className={styles.requirements}>
              <li>{PASSWORD_MIN_LENGTH}+ characters</li>
              <li>Upper and lowercase letters</li>
              <li>A number</li>
              <li>A symbol</li>
            </ul>
          ) : (
            <p className={styles.allMet}>All password requirements met.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
