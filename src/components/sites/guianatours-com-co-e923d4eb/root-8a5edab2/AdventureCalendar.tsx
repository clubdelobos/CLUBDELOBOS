"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarTourData } from "@/lib/queries/site-content";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

function dateParts(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month: month - 1, day };
}

function initialMonth(tours: CalendarTourData[]) {
  const today = new Date();
  const sorted = tours.map((tour) => dateParts(tour.departureDate)).sort((a, b) =>
    new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime());
  const upcoming = sorted.find((date) => new Date(date.year, date.month + 1, 0) >= today);
  return upcoming ?? sorted[0] ?? { year: today.getFullYear(), month: today.getMonth(), day: 1 };
}

function formatDate(iso: string) {
  const { year, month, day } = dateParts(iso);
  return `${day} de ${MONTHS[month]} de ${year}`;
}

function EventChip({ tour }: { tour: CalendarTourData }) {
  return (
    <Link
      href={`/salidas/${encodeURIComponent(tour.slug)}`}
      className="group relative block overflow-hidden rounded-md transition-transform hover:-translate-y-0.5"
    >
      <span className="relative block h-14 w-full bg-[var(--gn-palette-2)]">
        {tour.imageUrl ? (
          <Image src={tour.imageUrl} alt="" fill sizes="160px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : null}
        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
      </span>
      <span className="absolute inset-x-0 bottom-0 line-clamp-2 px-1.5 pb-1 pt-2 text-[9px] font-bold uppercase leading-[1.15] text-white">
        {tour.title}
      </span>
    </Link>
  );
}

export function AdventureCalendar({ tours }: { tours: CalendarTourData[] }) {
  const initial = useMemo(() => initialMonth(tours), [tours]);
  const [visible, setVisible] = useState({ year: initial.year, month: initial.month });
  const firstWeekday = (new Date(visible.year, visible.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(visible.year, visible.month + 1, 0).getDate();
  const previousMonthDays = new Date(visible.year, visible.month, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, index) => {
    const rawDay = index - firstWeekday + 1;
    if (rawDay < 1) return { day: previousMonthDays + rawDay, current: false, offset: -1 };
    if (rawDay > daysInMonth) return { day: rawDay - daysInMonth, current: false, offset: 1 };
    return { day: rawDay, current: true, offset: 0 };
  });
  // Drop trailing all-blank weeks so short months don't leave an empty row.
  const weeks = cells.length / 7;
  const usedWeeks = Math.max(1, ...Array.from({ length: weeks }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7).some((c) => c.current) ? w + 1 : 0));
  const visibleCells = cells.slice(0, usedWeeks * 7);

  function moveMonth(delta: number) {
    setVisible((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  const monthTours = tours.filter((tour) => {
    const date = dateParts(tour.departureDate);
    return date.year === visible.year && date.month === visible.month;
  });

  return (
    <section aria-label={`Calendario de ${MONTHS[visible.month]} de ${visible.year}`} className="mx-auto max-w-[880px]">
      <div className="flex items-center justify-between rounded-t-xl border border-black/10 bg-white px-3 py-3 sm:px-4">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior" className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-8)]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-center text-base font-extrabold capitalize text-[var(--gn-palette-3)] sm:text-lg">{MONTHS[visible.month]} {visible.year}</h2>
        <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente" className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-8)]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden grid-cols-7 border-l border-black/10 sm:grid">
        {WEEKDAYS.map((weekday) => <div key={weekday} className="border-b border-r border-black/10 bg-[var(--gn-palette-8)] px-1 py-2 text-center text-[11px] font-extrabold text-[var(--gn-palette-3)]">{weekday}</div>)}
        {visibleCells.map((cell, index) => {
          const events = cell.current ? monthTours.filter((tour) => dateParts(tour.departureDate).day === cell.day) : [];
          return (
            <div key={`${cell.offset}-${cell.day}-${index}`} className={`min-h-[84px] border-b border-r border-black/10 p-1.5 ${cell.current ? "bg-white" : "bg-black/[.025]"}`}>
              <span className={`text-[11px] font-bold ${cell.current ? "text-[var(--gn-palette-3)]" : "text-black/25"}`}>{cell.day}</span>
              <div className="mt-1 space-y-1">
                {events.map((tour) => <EventChip key={tour.id} tour={tour} />)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-b-xl border-x border-b border-black/10 bg-white p-3 sm:hidden">
        {monthTours.length ? (
          <div className="space-y-2.5">
            {monthTours.map((tour) => (
              <Link key={tour.id} href={`/salidas/${encodeURIComponent(tour.slug)}`} className="flex items-center gap-3 rounded-xl border border-black/10 p-2.5 transition-colors hover:bg-[var(--gn-palette-8)]">
                <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--gn-palette-8)]">
                  {tour.imageUrl ? <Image src={tour.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--gn-palette-1)]">{formatDate(tour.departureDate)}</span>
                  <strong className="mt-0.5 block truncate text-sm text-[var(--gn-palette-3)]">{tour.title}</strong>
                </span>
              </Link>
            ))}
          </div>
        ) : <p className="py-4 text-center text-sm text-[var(--gn-palette-5)]">No hay salidas publicadas para este mes.</p>}
      </div>
    </section>
  );
}
