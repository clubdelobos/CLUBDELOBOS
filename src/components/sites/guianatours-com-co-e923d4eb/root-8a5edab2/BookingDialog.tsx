"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarCheck2, Check, X } from "lucide-react";
import { createBooking } from "@/app/actions/bookings";
import { DateSelect } from "./DateSelect";

const inputCls =
  "h-10 rounded-lg border border-[#69727d] bg-white px-3 text-[15px] text-[#1f2124] outline-none transition-shadow focus:border-[var(--gn-palette-1)] focus:ring-2 focus:ring-[var(--gn-palette-1)]/25";

export interface BookingDialogProps {
  onClose: () => void;
  tourId: string;
  tourTitle: string;
  availableDates: string[];
  initialDate?: string;
  initialPeople?: number;
}

/**
 * Public booking form, opened from a tour card's button (see ProductCard.tsx).
 * The parent only mounts this component while the dialog is open (rather
 * than always mounting it and toggling a prop), so pending/error/done state
 * resets for free on every open instead of needing a setState-in-effect.
 * Submits through the createBooking Server Action — see
 * src/app/actions/bookings.ts for the honeypot + throttle + RLS story.
 * The request lands in the admin panel; the team follows up by WhatsApp.
 */
export function BookingDialog({
  onClose,
  tourId,
  tourTitle,
  availableDates,
  initialDate = "",
  initialPeople = 1,
}: BookingDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [date, setDate] = useState(initialDate || availableDates[0] || "");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while the dialog is up.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (done) closeRef.current?.focus();
  }, [done]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await createBooking({
      tourId,
      customerName: String(form.get("customerName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      requestedDate: String(form.get("requestedDate") ?? ""),
      numPeople: Number(form.get("numPeople") ?? 1),
      notes: String(form.get("notes") ?? ""),
      website: String(form.get("website") ?? ""),
    });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Reservar ${tourTitle}`}>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px] duration-200 animate-in fade-in"
      />
      <div className="relative flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_30px_80px_-12px_rgba(18,39,31,0.45)] duration-200 animate-in fade-in zoom-in-95 sm:p-7">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-3 text-center">
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gn-palette-8)] duration-500 animate-in zoom-in-50">
              <Image src="/brand/lobos/logo-black-640.png" alt="Club de Lobos" width={80} height={80} className="h-12 w-12 object-contain" />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-[var(--gn-palette-3)]">¡Tu solicitud fue recibida!</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--gn-palette-5)]">
                Guardamos tu solicitud para <strong className="text-[var(--gn-palette-3)]">{tourTitle}</strong>. El
                equipo de Club de Lobos se pondrá en contacto contigo por WhatsApp lo antes posible para confirmar
                los detalles. 🐺
              </p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="gn-button mt-1">
              <span className="inline-flex items-center">Entendido</span>
            </button>
          </div>
        ) : (
          <>
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Honeypot — hidden from real visitors via CSS, not `type="hidden"`,
                  since some bots skip hidden inputs but still fill visible-looking ones. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <label className="flex flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                Nombre completo
                <input name="customerName" required className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                Correo
                <input name="email" type="email" required className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                Teléfono
                <input name="phone" type="tel" required className={inputCls} />
              </label>
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                  Fecha deseada
                  <DateSelect name="requestedDate" size="sm" dates={availableDates} value={date} onChange={setDate} />
                </div>
                <label className="flex w-28 flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                  Personas
                  <input name="numPeople" type="number" min={1} max={50} defaultValue={initialPeople} required className={inputCls} />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                Notas (opcional)
                <textarea name="notes" className={inputCls + " h-20 py-2"} />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button type="submit" disabled={pending} className="gn-button mt-1 disabled:cursor-not-allowed disabled:opacity-60">
                {pending ? "Enviando…" : "Enviar solicitud"}
              </button>
              <p className="text-center text-[11px] leading-4 text-[var(--gn-palette-5)]">
                La solicitud no genera ningún cobro. Confirmaremos disponibilidad contigo.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
