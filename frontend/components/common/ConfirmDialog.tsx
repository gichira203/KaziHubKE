"use client";

/**
 * ConfirmDialog — accessible modal for consequential actions (sign out,
 * submitting verification). Closes on Escape and backdrop click; focus moves
 * to the confirm button when it opens.
 */
import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-[17px] font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[13.5px] font-semibold text-ink transition hover:border-brand hover:text-brand-dark"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "inline-flex h-10 items-center rounded-lg bg-error px-4 text-[13.5px] font-semibold text-white transition hover:bg-[#b91c1c]"
                : "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
