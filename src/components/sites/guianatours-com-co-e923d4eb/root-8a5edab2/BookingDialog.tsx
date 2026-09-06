"use client";

import { useEffect } from "react";
import { CalendarCheck2, X } from "lucide-react";
import { BookingForm } from "./BookingForm";

export interface BookingDialogProps {
  onClose: () => void;
  tourId: string;
  tourTitle: string;
  availableDates: string[];
  initialDate?: string;
  initialPeople?: number;
}

/**
 * Modal wrapper around <BookingForm>, opened from a tour card / booking panel.
 * The parent only mounts this while open, so form state resets for free.
 */
export function BookingDialog({ onClose, tourId, tourTitle, availableDates, initialDate = "", initialPeople = 1 }: BookingDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Reservar ${tourTitle}`}>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px] duration-200 animate-in fade-in"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_30px_80px_-12px_rgba(18,39,31,0.45)] duration-200 animate-in fade-in zoom-in-95 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gn-palette-7)] text-[var(--gn-palette-1)]">
              <CalendarCheck2 className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-extrabold leading-tight text-[var(--gn-palette-3)]">Solicitar reserva</h2>
              <p className="text-xs text-[var(--gn-palette-5)]">{tourTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--gn-palette-5)] transition-colors hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <BookingForm
          tourId={tourId}
          tourTitle={tourTitle}
          availableDates={availableDates}
          initialDate={initialDate}
          initialPeople={initialPeople}
          onDone={onClose}
        />
      </div>
    </div>
  );
}
