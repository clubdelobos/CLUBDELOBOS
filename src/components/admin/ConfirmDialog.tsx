"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, TriangleAlert } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  /** "danger" (default) = muted terracotta confirm; "default" = site button. */
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-panel confirmation modal — replaces `window.confirm` for destructive admin
 * actions so they match the panel's look instead of the raw browser dialog.
 * Palette-aware surface; the "danger" tone uses a muted terracotta, never the
 * bright system red.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  pending = false,
  error = null,
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, pending, onCancel]);

  // `open` only ever flips to true from a client interaction, so there's no SSR
  // render with the portal — the `document` guard is just belt-and-braces.
  if (!open || typeof document === "undefined") return null;

  const Icon = tone === "danger" ? Trash2 : TriangleAlert;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        disabled={pending}
        onClick={onCancel}
        className="absolute inset-0 h-full w-full cursor-default bg-[var(--gn-palette-3)]/45 backdrop-blur-[2px]"
      />
      <div className="admin-modal-surface relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gn-palette-8)] text-[#a3402f]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-[var(--gn-palette-3)]">{title}</h2>
            <div className="mt-2 text-sm leading-6 text-[var(--gn-palette-5)]">{message}</div>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-black/10 bg-[var(--gn-palette-8)] p-3 text-xs font-semibold leading-5 text-[#a3402f]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="h-10 rounded-lg border border-[#d9ded9] px-4 text-sm font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              tone === "danger"
                ? "h-10 rounded-lg bg-[#a3402f] px-4 text-sm font-bold text-white transition-colors hover:bg-[#8a3527] disabled:opacity-50"
                : "gn-button h-10 px-4 text-sm disabled:opacity-50"
            }
          >
            {pending ? "Un momento…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
