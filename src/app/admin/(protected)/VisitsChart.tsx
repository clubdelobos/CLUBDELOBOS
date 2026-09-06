"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAY = new Intl.DateTimeFormat("es-SV", { weekday: "short", timeZone: "UTC" });
const FULL_DATE = new Intl.DateTimeFormat("es-SV", { day: "numeric", month: "long", timeZone: "UTC" });

export interface DayVisits {
  date: string;
  count: number;
}

/**
 * Visits over the last 7 days. Slim bars that grow in once the card scrolls
 * into view, a peak marker, and a hover tooltip.
 */
export function VisitsChart({ dailyVisits }: { dailyVisits: DayVisits[] }) {
  const max = Math.max(1, ...dailyVisits.map((d) => d.count));
  const total = dailyVisits.reduce((sum, d) => sum + d.count, 0);
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="admin-card p-5 sm:col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Visitas · últimos 7 días</p>
        <p className="text-sm font-extrabold text-[var(--gn-palette-3)]">
          {total} <span className="text-xs font-semibold text-[var(--gn-palette-5)]">en total</span>
        </p>
      </div>

      <div className="mt-5 flex h-28 items-end gap-2.5">
        {dailyVisits.map((day, i) => {
          const pct = shown ? Math.max(3, (day.count / max) * 100) : 0;
          const isPeak = day.count === max && day.count > 0;
          return (
            <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="relative flex h-full items-end">
                <div
                  className={`w-full rounded-full transition-[height] duration-700 ease-out ${isPeak ? "bg-[var(--gn-palette-1)]" : "bg-[var(--gn-palette-1)]/35"}`}
                  style={{ height: `${pct}%`, transitionDelay: `${i * 60}ms` }}
                />
              </div>
              {/* tooltip */}
              <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--gn-palette-3)] px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {day.count} · {FULL_DATE.format(new Date(`${day.date}T00:00:00Z`))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-2.5">
        {dailyVisits.map((day) => (
          <span key={day.date} className="flex-1 text-center text-[10px] font-semibold uppercase text-[var(--gn-palette-5)]">
            {WEEKDAY.format(new Date(`${day.date}T00:00:00Z`))}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Visits by hour of day (UTC), last 7 days — a slim 24-bar strip. */
export function HourlyChart({ hourly }: { hourly: { hour: number; count: number }[] }) {
  const max = Math.max(1, ...hourly.map((h) => h.count));
  const busiest = hourly.reduce((a, b) => (b.count > a.count ? b : a), { hour: 0, count: 0 });
  return (
    <div className="admin-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Por hora del día</p>
        {busiest.count > 0 ? (
          <p className="text-xs font-semibold text-[var(--gn-palette-5)]">
            pico ~{String(busiest.hour).padStart(2, "0")}:00
          </p>
        ) : null}
      </div>
      <div className="mt-4 flex h-16 items-end gap-[3px]">
        {hourly.map((h) => (
          <div
            key={h.hour}
            title={`${String(h.hour).padStart(2, "0")}:00 · ${h.count}`}
            className="flex-1 rounded-sm bg-[var(--gn-palette-1)]/35"
            style={{ height: `${Math.max(4, (h.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-[var(--gn-palette-5)]">
        <span>00h</span>
        <span>12h</span>
        <span>23h</span>
      </div>
    </div>
  );
}
