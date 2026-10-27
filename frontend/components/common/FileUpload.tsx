"use client";

/**
 * File upload — drag-and-drop + browse button, with name/size display,
 * validation, replace and remove actions.
 *
 * Files are validated in the browser. Callers may upload them through an
 * authenticated backend handler before file metadata is returned to the UI.
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
  value: { fileName: string; fileSize: number; storageKey?: string } | null;
  onChange: (file: { fileName: string; fileSize: number; storageKey?: string } | null) => void | Promise<void>;
  onUploadFile?: (file: File) => Promise<string>;
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
  onUploadFile,
  helperText,
}: FileUploadProps) {
  const reactId = useId();
  const inputId = `${label}-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateUploadFile(file, allowedTypes, maxSize, kindLabel);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const storageKey = onUploadFile ? await onUploadFile(file) : undefined;
      await onChange({ fileName: file.name, fileSize: file.size, ...(storageKey ? { storageKey } : {}) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Could not upload this ${kindLabel.toLowerCase()}.`);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = async () => {
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    try {
      await onChange(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Could not remove this ${kindLabel.toLowerCase()}.`);
    }
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
              <button type="button" className={cx(styles.fileAction, styles.fileActionDanger)} onClick={() => void clearFile()}>
                Remove
              </button>
            </span>
          </div>
        ) : uploading ? (
          <div className={styles.uploading}>
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.uploadingText}>{onUploadFile ? "Uploading securely…" : "Checking file…"}</span>
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
          {value.storageKey ? "Uploaded to your private KaziHub storage." : "File ready on this device."}
        </p>
      ) : null}
    </div>
  );
}
