"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TourSeries } from "@/lib/queries/analytics";

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
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, shown };
}

/** Catmull-Rom → cubic-bezier, so a series of points reads as one smooth curve. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M${pts[0].x},${pts[0].y}` : "";
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

interface CurveProps {
  values: number[];
  labels: string[];
  gradientId: string;
  height?: number;
  shown: boolean;
}

/** A single smooth area curve. Non-scaling stroke keeps it crisp at any width. */
function Curve({ values, labels, gradientId, height = 150, shown }: CurveProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const PAD_X = 10;
  const PAD_Y = 14;
  const max = Math.max(1, ...values);
  const n = values.length;

  const pts = values.map((v, i) => ({
    x: n <= 1 ? W / 2 : PAD_X + (i / (n - 1)) * (W - PAD_X * 2),
    y: H - PAD_Y - (v / max) * (H - PAD_Y * 2),
  }));

  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gn-palette-1)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--gn-palette-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms" }} />
        <path
          d={line}
          fill="none"
          stroke="var(--gn-palette-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: shown ? 0 : 1, transition: "stroke-dashoffset 900ms ease-out" }}
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 5 : 3}
            fill="var(--gn-palette-1)"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: shown ? 1 : 0, transition: "opacity 400ms, r 150ms" }}
          />
        ))}
        {pts.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={i === 0 ? 0 : (pts[i - 1].x + p.x) / 2}
            y={0}
            width={W / n}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null ? (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-lg bg-[var(--gn-palette-3)] px-2 py-1 text-[11px] font-semibold text-white"
          style={{ left: `${(pts[hover].x / W) * 100}%` }}
        >
          {values[hover]} · {labels[hover]}
        </div>
      ) : null}

      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase text-[var(--gn-palette-5)]">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function VisitsChart({ dailyVisits, weekdays }: { dailyVisits: { date: string; count: number }[]; weekdays: string[] }) {
  const { ref, shown } = useReveal();
  const total = dailyVisits.reduce((s, d) => s + d.count, 0);
  return (
    <div ref={ref} className="admin-card flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Visitas · 7 días</p>
        <p className="text-sm font-extrabold text-[var(--gn-palette-3)]">
          {total} <span className="text-xs font-semibold text-[var(--gn-palette-5)]">total</span>
        </p>
      </div>
      <div className="mt-4">
        <Curve values={dailyVisits.map((d) => d.count)} labels={weekdays} gradientId="visits-curve" shown={shown} />
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
    <div ref={ref} className="admin-card flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Por hora del día</p>
        {busiest.count > 0 ? (
          <p className="text-xs font-semibold text-[var(--gn-palette-5)]">pico ~{String(busiest.hour).padStart(2, "0")}:00</p>
        ) : null}
      </div>
      <div className="mt-4 flex h-[132px] items-end gap-[3px]">
        {hourly.map((h, i) => (
          <div
            key={h.hour}
            title={`${String(h.hour).padStart(2, "0")}:00 · ${h.count}`}
            className={`flex-1 rounded-[2px] transition-[height,background-color] duration-500 ${h.hour === busiest.hour && busiest.count > 0 ? "bg-[var(--gn-palette-1)]" : "bg-[var(--gn-palette-1)]/30"}`}
            style={{ height: shown ? `${Math.max(4, (h.count / max) * 100)}%` : "4%", transitionDelay: `${i * 16}ms` }}
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

/** Per-tour clicks over the week — a ranked list where each row expands into
 *  its own smooth curve. */
export function TourClicksPanel({ tours, weekdays }: { tours: TourSeries[]; weekdays: string[] }) {
  const { ref, shown } = useReveal();
  const [openLabel, setOpenLabel] = useState<string | null>(tours[0]?.label ?? null);
  const max = Math.max(1, ...tours.map((t) => t.total));

  return (
    <div ref={ref} className="admin-card flex flex-col p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Clics por salida · 7 días</p>
      {tours.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gn-palette-5)]">Sin clics en salidas todavía.</p>
      ) : (
        <ul className="mt-3 divide-y divide-black/[0.06]">
          {tours.map((tour) => {
            const open = openLabel === tour.label;
            return (
              <li key={tour.label}>
                <button
                  type="button"
                  onClick={() => setOpenLabel(open ? null : tour.label)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--gn-palette-3)]">{tour.label}</span>
                    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--gn-palette-1)]/10">
                      <span className="block h-full rounded-full bg-[var(--gn-palette-1)]/45" style={{ width: `${(tour.total / max) * 100}%` }} />
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-extrabold text-[var(--gn-palette-1)]">{tour.total}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--gn-palette-5)] transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="pb-3 pt-1">
                    <Curve
                      values={tour.daily}
                      labels={weekdays}
                      gradientId={`tour-${tour.label.replace(/[^a-z0-9]/gi, "")}`}
                      height={110}
                      shown={shown}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
