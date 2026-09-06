"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
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
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[300px] max-w-[85vw] overflow-hidden rounded-xl border border-black/10 bg-white text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <p className="text-sm font-extrabold text-[var(--gn-palette-3)]">Mis salidas guardadas</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-[var(--gn-palette-5)] hover:text-[var(--gn-palette-3)]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--gn-palette-5)]">
              Aún no guardas ninguna salida. Usa el corazón en cada aventura para agregarla aquí.
            </p>
          ) : (
            <>
              <ul className="max-h-[240px] divide-y divide-black/5 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.slug} className="flex items-center gap-2 px-4 py-2.5">
                    <a href={`/salidas/${encodeURIComponent(item.slug)}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--gn-palette-3)]">{item.title}</span>
                      {item.price ? <span className="text-xs text-[var(--gn-palette-5)]">{item.price}</span> : null}
                    </a>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      aria-label={`Quitar ${item.title}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--gn-palette-5)] transition-colors hover:bg-black/5 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 border-t border-black/5 p-3">
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg bg-[var(--gn-palette-1)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--gn-palette-2)]"
                  >
                    Consultar {items.length === 1 ? "esta salida" : `estas ${items.length}`} por WhatsApp
                  </a>
                ) : null}
                <button type="button" onClick={clear} className="text-xs font-semibold text-[var(--gn-palette-5)] hover:text-red-600">
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
