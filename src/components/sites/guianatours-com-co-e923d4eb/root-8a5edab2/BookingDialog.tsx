"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck2, CheckCircle2, X } from "lucide-react";
import { createBooking } from "@/app/actions/bookings";

const inputCls =
  "h-10 rounded-lg border border-[#69727d] bg-white px-3 text-[15px] text-[#1f2124] outline-none transition-shadow focus:border-[var(--gn-palette-1)] focus:ring-2 focus:ring-[var(--gn-palette-1)]/25";

export interface BookingDialogProps {
  onClose: () => void;
  tourId: string;
  tourTitle: string;
  availableDates: string[];
  initialDate?: string;
  initialPeople?: number;
  whatsappNumber: string;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** WhatsApp glyph — inlined so the success screen needs no icon-font/CDN. */
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.887 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.652a11.98 11.98 0 005.71 1.454h.005c6.582 0 11.941-5.359 11.944-11.945a11.86 11.86 0 00-3.48-8.408" />
    </svg>
  );
}

/**
 * Public booking form, opened from a tour card's button (see ProductCard.tsx).
 * The parent only mounts this component while the dialog is open (rather
 * than always mounting it and toggling a prop), so pending/error/done state
 * resets for free on every open instead of needing a setState-in-effect.
 * Submits through the createBooking Server Action — see
 * src/app/actions/bookings.ts for the honeypot + throttle + RLS story.
 * After a successful save it offers a one-tap WhatsApp handoff (wa.me) so
 * the team gets the request on their phone right away.
 */
export function BookingDialog({
  onClose,
  tourId,
  tourTitle,
  availableDates,
  initialDate = "",
  initialPeople = 1,
  whatsappNumber,
}: BookingDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);
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

  function buildWaUrl(fields: {
    name: string;
    date: string;
    people: number;
    email: string;
    phone: string;
    notes: string;
  }) {
    if (!whatsappNumber) return null;
    const lines = [
      `Hola, quiero reservar una salida con Club de Lobos.`,
      ``,
      `Salida: ${tourTitle}`,
      `Nombre: ${fields.name}`,
      `Fecha deseada: ${fields.date ? formatDate(fields.date) : "Por confirmar"}`,
      `Personas: ${fields.people}`,
      `Correo: ${fields.email}`,
      `Teléfono: ${fields.phone}`,
    ];
    if (fields.notes.trim()) lines.push(`Notas: ${fields.notes.trim()}`);
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const fields = {
      name: String(form.get("customerName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      date: String(form.get("requestedDate") ?? ""),
      people: Number(form.get("numPeople") ?? 1),
      notes: String(form.get("notes") ?? ""),
    };
    const result = await createBooking({
      tourId,
      customerName: fields.name,
      email: fields.email,
      phone: fields.phone,
      requestedDate: fields.date,
      numPeople: fields.people,
      notes: fields.notes,
      website: String(form.get("website") ?? ""),
    });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const url = buildWaUrl(fields);
    setWaUrl(url);
    setDone(true);
    // Best-effort: this runs inside the submit handler's gesture chain, so
    // most browsers still allow the pop-up. The on-screen button is the
    // reliable fallback if it's blocked.
    if (url) window.open(url, "_blank", "noopener,noreferrer");
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
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 duration-500 animate-in zoom-in-50">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-[var(--gn-palette-3)]">¡Solicitud recibida!</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--gn-palette-5)]">
                Registramos tu solicitud para <strong className="text-[var(--gn-palette-3)]">{tourTitle}</strong>.
                Nos pondremos en contacto contigo lo más pronto posible para confirmar disponibilidad.
              </p>
            </div>

            {waUrl ? (
              <>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-100"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Enviar confirmación por WhatsApp
                </a>
                <p className="text-[11px] leading-4 text-[var(--gn-palette-5)]">
                  Se abrió una ventana de WhatsApp con tu solicitud lista para enviar. Si no apareció, usa el botón.
                </p>
              </>
            ) : null}

            <button ref={closeRef} type="button" onClick={onClose} className="text-sm font-semibold text-[var(--gn-palette-1)] hover:underline">
              Cerrar
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
                <label className="flex flex-1 flex-col gap-1 text-sm text-[var(--gn-palette-3)]">
                  Fecha deseada
                  <select name="requestedDate" defaultValue={initialDate} required className={inputCls}>
                    {availableDates.length === 0 ? <option value="">Sin fechas disponibles</option> : null}
                    {availableDates.map((date) => <option key={date} value={date}>{formatDate(date)}</option>)}
                  </select>
                </label>
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
