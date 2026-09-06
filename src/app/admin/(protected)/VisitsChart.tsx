"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAY = new Intl.DateTimeFormat("es-SV", { weekday: "short", timeZone: "UTC" });
const FULL_DATE = new Intl.DateTimeFormat("es-SV", { day: "numeric", month: "long", timeZone: "UTC" });

export interface DayVisits {
  date: string;
  count: number;
}

function useReveal() {
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
  return { ref, shown };
}

/**
 * Visits over the last 7 days as a thin area chart: a smooth line, a soft
 * gradient fill, dots on each day, and a hover tooltip. The line draws itself
 * in when the card scrolls into view.
 */
export function VisitsChart({ dailyVisits }: { dailyVisits: DayVisits[] }) {
  const { ref, shown } = useReveal();
  const [hover, setHover] = useState<number | null>(null);

  const W = 320;
  const H = 96;
  const PAD = 6;
  const max = Math.max(1, ...dailyVisits.map((d) => d.count));
  const total = dailyVisits.reduce((sum, d) => sum + d.count, 0);
  const n = dailyVisits.length;

  const pts = dailyVisits.map((d, i) => ({
    x: n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2),
    y: H - PAD - (d.count / max) * (H - PAD * 2),
    d,
    i,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]?.x.toFixed(1)},${H} L${pts[0]?.x.toFixed(1)},${H} Z`;

  return (
    <div ref={ref} className="admin-card p-5 sm:col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Visitas · últimos 7 días</p>
        <p className="text-sm font-extrabold text-[var(--gn-palette-3)]">
          {total} <span className="text-xs font-semibold text-[var(--gn-palette-5)]">en total</span>
        </p>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="visits-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gn-palette-1)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--gn-palette-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#visits-fill)" className="transition-opacity duration-500" style={{ opacity: shown ? 1 : 0 }} />
          <path
            d={line}
            fill="none"
            stroke="var(--gn-palette-1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: shown ? 0 : 1,
              transition: "stroke-dashoffset 900ms ease-out",
            }}
          />
          {pts.map((p) => (
            <circle
              key={p.d.date}
              cx={p.x}
              cy={p.y}
              r={hover === p.i ? 4 : 2.5}
              fill="var(--gn-palette-1)"
              className="transition-[r,opacity] duration-300"
              style={{ opacity: shown ? 1 : 0 }}
            />
          ))}
          {/* hover hit areas */}
          {pts.map((p, i) => (
            <rect
              key={`hit-${p.d.date}`}
              x={i === 0 ? 0 : (pts[i - 1].x + p.x) / 2}
              y={0}
              width={n <= 1 ? W : W / n}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>

        {hover !== null ? (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[var(--gn-palette-3)] px-2 py-1 text-[11px] font-semibold text-white"
            style={{ left: `${(pts[hover].x / W) * 100}%` }}
          >
            {pts[hover].d.count} · {FULL_DATE.format(new Date(`${pts[hover].d.date}T00:00:00Z`))}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase text-[var(--gn-palette-5)]">
        {dailyVisits.map((day) => (
          <span key={day.date}>{WEEKDAY.format(new Date(`${day.date}T00:00:00Z`))}</span>
        ))}
      </div>
    </div>
  );
}

/** Visits by hour of day (UTC), last 7 days — a slim 24-bar strip. */
export function HourlyChart({ hourly }: { hourly: { hour: number; count: number }[] }) {
  const { ref, shown } = useReveal();
  const max = Math.max(1, ...hourly.map((h) => h.count));
  const busiest = hourly.reduce((a, b) => (b.count > a.count ? b : a), { hour: 0, count: 0 });
  return (
    <div ref={ref} className="admin-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Por hora del día</p>
        {busiest.count > 0 ? (
          <p className="text-xs font-semibold text-[var(--gn-palette-5)]">pico ~{String(busiest.hour).padStart(2, "0")}:00</p>
        ) : null}
      </div>
      <div className="mt-4 flex h-16 items-end gap-[3px]">
        {hourly.map((h, i) => (
          <div
            key={h.hour}
            title={`${String(h.hour).padStart(2, "0")}:00 · ${h.count}`}
            className={`flex-1 rounded-[2px] transition-[height,background-color] duration-500 ${h.hour === busiest.hour && busiest.count > 0 ? "bg-[var(--gn-palette-1)]" : "bg-[var(--gn-palette-1)]/30"}`}
            style={{ height: shown ? `${Math.max(4, (h.count / max) * 100)}%` : "4%", transitionDelay: `${i * 18}ms` }}
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
