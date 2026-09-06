"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

/** Shared editing surface for admin cards — keeps the underlying grid a
 * uniform, always-compact layout instead of one card growing inline and
 * throwing off the row it sits in. */
export function Modal({ title, onClose, children, maxWidthClassName = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px]" />
      <div className={`admin-modal-surface relative flex max-h-[90vh] w-full flex-col rounded-2xl border shadow-2xl ${maxWidthClassName}`}>
        <div className="admin-modal-bar flex shrink-0 items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-extrabold text-[var(--gn-palette-3)]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--gn-palette-5)] transition-colors hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
