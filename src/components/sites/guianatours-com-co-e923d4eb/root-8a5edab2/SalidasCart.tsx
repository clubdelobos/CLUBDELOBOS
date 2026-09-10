"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, Heart, Trash2, X } from "lucide-react";
import { getTourBookingInfo, type TourBookingInfo } from "@/app/actions/bookings";
import { ShoppingCartIcon } from "@/components/sites/guianatours-com-co-e923d4eb/shared/icons";
import { WhatsAppGlyph } from "@/components/sites/guianatours-com-co-e923d4eb/shared/WhatsAppGlyph";
import { cn } from "@/lib/utils";
import { BookingForm } from "./BookingForm";
import { useSalidasCart } from "./salidas-cart";

/**
 * Header "lista de salidas guardadas". The icon shows how many salidas the
 * visitor shortlisted; the dropdown lets them review, remove, clear, finish a
 * booking (the form drops in place), or WhatsApp the whole list at once with
 * the message pre-written from the cart contents.
 */
export function SalidasCart({ className, phoneHref }: { className?: string; phoneHref: string }) {
  const { items, remove, clear } = useSalidasCart();
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState<TourBookingInfo | null>(null);
  const [bookingSlug, setBookingSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const number = phoneHref.replace(/\D/g, "");

  async function startBooking(slug: string) {
    setLoadingSlug(slug);
    const info = await getTourBookingInfo(slug).catch(() => null);
    setLoadingSlug(null);
    if (info) {
      setBooking(info);
      setBookingSlug(slug);
    }
  }

  function closeBooking() {
    setBooking(null);
    setBookingSlug(null);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (booking) closeBooking();
      else setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, booking]);

  // Include each salida's page URL so WhatsApp renders a link preview (the
  // tour's cover photo + title come from that page's Open Graph tags).
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const waHref = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(
        [
          items.length === 1
            ? "Hola, quiero información y disponibilidad de esta salida de Club de Lobos:"
            : "Hola, me interesan estas salidas de Club de Lobos:",
          "",
          ...items.map(
            (item) =>
              `• ${item.title}${item.price ? ` (${item.price})` : ""}\n${origin}/salidas/${encodeURIComponent(item.slug)}`,
          ),
          "",
          "¿Me pueden ayudar?",
        ].join("\n"),
      )}`
    : null;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Salidas guardadas (${items.length})`}
        aria-expanded={open}
        className="relative flex items-center text-white transition-transform hover:scale-105"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {items.length > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--gn-palette-7)] px-1 text-[10px] font-bold leading-none text-[var(--gn-palette-2)]">
            {items.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] max-w-[86vw] origin-top-right overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-[0_26px_64px_-14px_rgba(0,0,0,0.4)] duration-150 animate-in fade-in zoom-in-95 slide-in-from-top-1">
          {booking ? (
            <div className="p-4">
              <button
                type="button"
                onClick={closeBooking}
                className="mb-2 -ml-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--gn-palette-5)] transition-colors hover:text-[var(--gn-palette-3)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a la lista
              </button>
              <p className="mb-3 text-sm font-extrabold text-[var(--gn-palette-3)]">{booking.title}</p>
              <BookingForm
                compact
                tourId={booking.tourId}
                tourTitle={booking.title}
                availableDates={booking.availableDates}
                onSuccess={() => {
                  if (bookingSlug) remove(bookingSlug);
                }}
                onDone={closeBooking}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
                <p className="text-sm font-extrabold text-[var(--gn-palette-3)]">Mis salidas guardadas</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-5)] transition-colors hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-1 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]">
                    <Heart className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-5 text-[var(--gn-palette-5)]">
                    Toca el corazón en cada aventura para guardarla aquí.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="no-scrollbar max-h-[300px] space-y-1 overflow-y-auto px-2.5 pb-0">
                    {items.map((item) => (
                      <li key={item.slug} className="rounded-xl pb-1 pt-2 transition-colors hover:bg-[var(--gn-palette-8)]">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/salidas/${encodeURIComponent(item.slug)}`}
                            onClick={() => setOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-2.5"
                          >
                            {item.image ? (
                              <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--gn-palette-8)]">
                                <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                              </span>
                            ) : null}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-[var(--gn-palette-3)]">{item.title}</span>
                              {item.price ? <span className="block text-xs text-[var(--gn-palette-5)]">{item.price}</span> : null}
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(item.slug)}
                            aria-label={`Quitar ${item.title}`}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--gn-palette-5)] transition-colors hover:bg-black/5 hover:text-[var(--gn-palette-1)]"
                          >
                            <Trash2 className="h-[15px] w-[15px]" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => startBooking(item.slug)}
                          disabled={loadingSlug === item.slug}
                          className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--gn-palette-1)]/35 px-3 text-[13px] font-bold text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-1)] hover:text-white disabled:opacity-50"
                        >
                          <CalendarCheck2 className="h-4 w-4 shrink-0" />
                          {loadingSlug === item.slug ? "Abriendo…" : "Terminar reserva"}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-1">
                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--gn-palette-1)] px-3 text-[13px] font-bold text-white transition-colors hover:bg-[var(--gn-palette-2)]"
                      >
                        <WhatsAppGlyph className="h-4 w-4 shrink-0" />
                        Consultar por WhatsApp
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={clear}
                      className="self-center text-[11px] font-semibold text-[var(--gn-palette-5)] transition-colors hover:text-[var(--gn-palette-3)]"
                    >
                      Vaciar lista
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
