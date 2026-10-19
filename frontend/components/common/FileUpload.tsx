"use client";

/**
 * File upload — drag-and-drop + browse button, with name/size display,
 * validation, replace and remove actions.
 *
 * Files are validated in the browser and held in component state only. Nothing
 * is uploaded to a server yet (there is no backend); the component reports the
 * chosen file back to the parent so metadata can be shown in the profile review.
 */
import { useRef, useState } from "react";
import { useId } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { cx } from "@/lib/cx";
import { formatFileSize, validateUploadFile } from "@/lib/validation";
import styles from "./FileUpload.module.css";

type FileUploadProps = {
  label: string;
  /** File kinds accepted, e.g. ["pdf", "docx"]. Drives the accept attribute. */
  accept: string;
  allowedTypes: readonly string[];
  maxSize: number;
  /** Human label used in error messages, e.g. "CV". */
  kindLabel: string;
  value: { fileName: string; fileSize: number } | null;
  onChange: (file: { fileName: string; fileSize: number } | null) => void;
  helperText?: string;
};

export default function FileUpload({
  label,
  accept,
  allowedTypes,
  maxSize,
  kindLabel,
  value,
  onChange,
  helperText,
}: FileUploadProps) {
  const reactId = useId();
  const inputId = `${label}-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateUploadFile(file, allowedTypes, maxSize, kindLabel);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    // Simulated progress: the file is validated and staged locally. Replace
    // with the real upload + progress events once an endpoint exists.
    setUploading(true);
    window.setTimeout(() => {
      onChange({ fileName: file.name, fileSize: file.size });
      setUploading(false);
    }, 600);
  };

  const clearFile = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${inputId}-label`}>
        {label}
        <span className={styles.optional}> (optional)</span>
      </span>

      <div
        className={cx(
          styles.dropzone,
          dragging && styles.dropzoneActive,
          error && styles.dropzoneError,
          value && styles.dropzoneFilled,
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        aria-labelledby={`${inputId}-label`}
      >
        {value ? (
          <div className={styles.fileRow}>
            <span className={styles.fileIcon}>
              <FileText size={20} aria-hidden="true" />
            </span>
            <span className={styles.fileMeta}>
              <span className={styles.fileName}>{value.fileName}</span>
              <span className={styles.fileSize}>{formatFileSize(value.fileSize)}</span>
            </span>
            <span className={styles.fileActions}>
              <button
                type="button"
                className={styles.fileAction}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button type="button" className={cx(styles.fileAction, styles.fileActionDanger)} onClick={clearFile}>
                Remove
              </button>
            </span>
          </div>
        ) : uploading ? (
          <div className={styles.uploading}>
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.uploadingText}>Checking file…</span>
          </div>
        ) : (
          <>
            <span className={styles.uploadIcon} aria-hidden="true">
              <Upload size={22} />
            </span>
            <p className={styles.dropText}>
              Drag and drop your file here, or{" "}
              <button type="button" className={styles.browse} onClick={() => inputRef.current?.click()}>
                browse
              </button>
            </p>
            <p className={styles.dropNote}>
              {accept.toUpperCase()} · up to {formatFileSize(maxSize)}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={styles.hiddenInput}
          accept={accept}
          onChange={(event) => handleFiles(event.target.files)}
          aria-label={`${label} file`}
        />
      </div>

      {helperText ? <p className={styles.helper}>{helperText}</p> : null}

      {error ? (
        <p className={styles.error} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {value && !error ? (
        <p className={styles.success} role="status">
          <CheckCircle2 size={14} aria-hidden="true" />
          File ready. It stays on this device until the upload service is connected.
        </p>
      ) : null}
    </div>
  );
}
