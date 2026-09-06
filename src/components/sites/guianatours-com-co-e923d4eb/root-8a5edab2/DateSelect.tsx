"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface DateSelectProps {
  /** ISO dates (yyyy-mm-dd). */
  dates: string[];
  value: string;
  onChange: (value: string) => void;
  /** When set, a hidden input with this name carries the value for a plain <form>. */
  name?: string;
  className?: string;
  disabled?: boolean;
  size?: "md" | "sm";
}

/**
 * Palette-themed replacement for a native <select> of departure dates — the
 * OS dropdown is unstyleable and clashes hard with the site theme. Keeps a
 * hidden input so it still works inside an uncontrolled <form>.
 */
export function DateSelect({ dates, value, onChange, name, className, disabled, size = "md" }: DateSelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const empty = dates.length === 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function choose(date: string) {
    onChange(date);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (empty || disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) => {
        const next = e.key === "ArrowDown" ? i + 1 : i - 1;
        return (next + dates.length) % dates.length;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) choose(dates[active]);
      else setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        disabled={disabled || empty}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--gn-palette-1)_22%,#d9ded9)] bg-white px-3 text-left text-sm font-medium text-[var(--gn-palette-3)] transition-colors hover:border-[var(--gn-palette-1)] focus-visible:border-[var(--gn-palette-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gn-palette-1)]/25 disabled:opacity-60",
          size === "sm" ? "h-10" : "h-12",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-[var(--gn-palette-1)]" />
        <span className="flex-1 truncate">{empty ? "Sin fechas disponibles" : formatDate(value || dates[0])}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--gn-palette-5)] transition-transform", open && "rotate-180")} />
      </button>

      {open && !empty ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-black/[0.07] bg-white p-1 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.3)]"
        >
          {dates.map((date, i) => {
            const selected = date === value;
            return (
              <li key={date}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(date)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    selected
                      ? "bg-[var(--gn-palette-1)] text-white"
                      : active === i
                        ? "bg-[var(--gn-palette-8)] text-[var(--gn-palette-3)]"
                        : "text-[var(--gn-palette-3)]",
                  )}
                >
                  {formatDate(date)}
                  {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
