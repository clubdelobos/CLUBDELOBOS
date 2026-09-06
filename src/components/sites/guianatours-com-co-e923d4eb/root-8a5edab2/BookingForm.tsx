"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { createBooking } from "@/app/actions/bookings";
import { DateSelect } from "./DateSelect";

const inputCls =
  "h-10 rounded-lg border border-[#69727d] bg-white px-3 text-[15px] text-[#1f2124] outline-none transition-shadow focus:border-[var(--gn-palette-1)] focus:ring-2 focus:ring-[var(--gn-palette-1)]/25";

export interface BookingFormProps {
  tourId: string;
  tourTitle: string;
  availableDates: string[];
  initialDate?: string;
  initialPeople?: number;
  /** Called after the visitor dismisses the success screen. */
  onDone?: () => void;
  /** Tighter spacing + smaller inputs for the cart dropdown. */
  compact?: boolean;
}

/**
 * The booking form itself (fields → createBooking → success), with no chrome.
 * Wrapped by <BookingDialog> for the modal, or dropped inline into the cart.
 * The request lands in the admin panel; the team follows up by WhatsApp.
 */
export function BookingForm({
  tourId,
  tourTitle,
  availableDates,
  initialDate = "",
  initialPeople = 1,
  onDone,
  compact = false,
}: BookingFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [date, setDate] = useState(initialDate || availableDates[0] || "");

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

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gn-palette-8)] duration-500 animate-in zoom-in-50">
          <Image src="/brand/lobos/logo-black-640.png" alt="Club de Lobos" width={64} height={64} className="h-10 w-10 object-contain" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </span>
        <div>
          <p className="text-base font-extrabold text-[var(--gn-palette-3)]">¡Tu solicitud fue recibida!</p>
          <p className="mt-1.5 text-sm leading-6 text-[var(--gn-palette-5)]">
            Guardamos tu solicitud para <strong className="text-[var(--gn-palette-3)]">{tourTitle}</strong>. El equipo de
            Club de Lobos te contactará por WhatsApp para confirmar los detalles. 🐺
          </p>
        </div>
        <button type="button" onClick={onDone} className="gn-button mt-1">
          <span className="inline-flex items-center">Entendido</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col ${compact ? "gap-2.5" : "gap-3"}`}>
      {/* Honeypot — hidden from real visitors via CSS, not type="hidden". */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
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
      <div className={compact ? "flex flex-col gap-2.5" : "flex gap-3"}>
        <div className="flex flex-1 flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
          Fecha deseada
          <DateSelect name="requestedDate" size="sm" dates={availableDates} value={date} onChange={setDate} />
        </div>
        <label className={`flex flex-col gap-1 text-sm text-[var(--gn-palette-3)] ${compact ? "" : "w-24"}`}>
          Personas
          <input name="numPeople" type="number" min={1} max={50} defaultValue={initialPeople} required className={`${inputCls} ${compact ? "w-24" : ""}`} />
        </label>
      </div>
      {!compact ? (
        <label className="flex flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
          Notas (opcional)
          <textarea name="notes" className={inputCls + " h-20 py-2"} />
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="gn-button mt-1 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
      <p className="text-center text-[11px] leading-4 text-[var(--gn-palette-5)]">
        La solicitud no genera ningún cobro. Confirmaremos disponibilidad contigo.
      </p>
    </form>
  );
}
