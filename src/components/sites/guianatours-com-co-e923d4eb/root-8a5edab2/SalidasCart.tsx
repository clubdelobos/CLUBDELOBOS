"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Mountain, X } from "lucide-react";
import { ShoppingCartIcon } from "@/components/sites/guianatours-com-co-e923d4eb/shared/icons";
import { cn } from "@/lib/utils";
import { useSalidasCart } from "./salidas-cart";

/**
 * Header "lista de salidas guardadas". The icon shows how many salidas the
 * visitor has shortlisted; the dropdown lets them review, remove, clear, or
 * send the whole list to the team on WhatsApp in one message.
 */
export function SalidasCart({ className, phoneHref }: { className?: string; phoneHref: string }) {
  const { items, remove, clear } = useSalidasCart();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const number = phoneHref.replace(/\D/g, "");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const waHref = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(
        [
          "Hola, me interesan estas salidas de Club de Lobos:",
          "",
          ...items.map((item, i) => `${i + 1}. ${item.title}${item.price ? ` — ${item.price}` : ""}`),
          "",
          "¿Me pueden dar más información?",
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
        <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[320px] max-w-[88vw] overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-[0_28px_70px_-12px_rgba(0,0,0,0.4)] duration-150 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
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
            <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]">
                <Heart className="h-5 w-5" />
              </span>
              <p className="text-sm leading-5 text-[var(--gn-palette-5)]">
                Aún no guardas ninguna salida. Toca el corazón en cada aventura para agregarla aquí.
              </p>
            </div>
          ) : (
            <>
              <ul className="no-scrollbar max-h-[260px] overflow-y-auto px-2 pb-2">
                {items.map((item) => (
                  <li key={item.slug} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--gn-palette-8)]">
                    <Link
                      href={`/salidas/${encodeURIComponent(item.slug)}`}
                      onClick={() => setOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <span className="relative flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]/40">
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                        ) : (
                          <Mountain className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[var(--gn-palette-3)]">{item.title}</span>
                        {item.price ? <span className="block text-xs text-[var(--gn-palette-5)]">{item.price}</span> : null}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      aria-label={`Quitar ${item.title}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--gn-palette-5)] opacity-60 transition-colors hover:bg-black/5 hover:text-[var(--gn-palette-3)] group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 border-t border-black/[0.06] p-3">
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-xl bg-[var(--gn-palette-1)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--gn-palette-2)]"
                  >
                    Consultar {items.length === 1 ? "esta salida" : `las ${items.length}`} por WhatsApp
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={clear}
                  className="self-center text-xs font-semibold text-[var(--gn-palette-5)] transition-colors hover:text-[var(--gn-palette-3)]"
                >
                  Vaciar lista
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
