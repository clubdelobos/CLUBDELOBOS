"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarX2, Check, MoreVertical, Trash2, X } from "lucide-react";
import { deleteBooking, updateBookingStatus } from "./actions";
import type { BookingStatus, ProfileRole } from "@/lib/supabase/types";

const MENU_WIDTH = 160;

export interface BookingRow {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  requested_date: string;
  num_people: number;
  status: BookingStatus;
  created_at: string;
  tourTitle: string;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

function StatusMenu({ status, pending, onConfirm, onCancel, onDelete }: {
  status: BookingStatus;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    // Position was computed from the trigger's rect at open time — any scroll
    // or resize invalidates it, so just close rather than track and reposition.
    function onScrollOrResize() { setOpen(false); }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <div className="flex w-[132px] items-center justify-between gap-2">
      <span className="text-sm font-medium text-[var(--gn-palette-3)]">{STATUS_LABEL[status]}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        disabled={pending}
        aria-label="Cambiar estado de la reserva"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--gn-palette-5)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && coords
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ position: "fixed", top: coords.top, left: coords.left, width: MENU_WIDTH }}
              className="z-[1000] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-xl"
            >
              {status !== "confirmed" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setOpen(false); onConfirm(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-8)]"
                >
                  <Check className="h-3.5 w-3.5" />Confirmar
                </button>
              ) : null}
              {status !== "cancelled" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setOpen(false); onCancel(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[var(--gn-palette-5)] transition-colors hover:bg-[var(--gn-palette-8)] hover:text-[var(--gn-palette-3)]"
                >
                  <X className="h-3.5 w-3.5" />Cancelar
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onDelete(); }}
                className="mt-1 flex w-full items-center gap-2 border-t border-black/[0.06] px-3 py-2 pt-2.5 text-left text-xs font-semibold text-[var(--gn-palette-5)] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />Eliminar
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function Row({ booking, canEdit, onChanged }: { booking: BookingRow; canEdit: boolean; onChanged: (next: BookingRow | null) => void }) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: BookingStatus) {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, status);
      if (!result.error) onChanged({ ...booking, status });
    });
  }

  function remove() {
    if (!window.confirm(`¿Eliminar la reserva de ${booking.customer_name}?`)) return;
    startTransition(async () => {
      const result = await deleteBooking(booking.id);
      if (!result.error) onChanged(null);
    });
  }

  return (
    <tr className="border-b border-black/5 transition-colors last:border-0 hover:bg-[var(--gn-palette-8)]">
      <td className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--gn-palette-3)]">{booking.customer_name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--gn-palette-5)]">{booking.email}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--gn-palette-5)]">{booking.phone}</td>
      <td className="px-4 py-3 font-medium text-[var(--gn-palette-3)]">{booking.tourTitle}</td>
      <td className="px-4 py-3 text-[var(--gn-palette-5)]">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--gn-palette-1)]" />
          {new Date(`${booking.requested_date}T00:00:00Z`).toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
        </span>
      </td>
      <td className="px-4 py-3 text-[var(--gn-palette-5)]">{booking.num_people}</td>
      <td className="px-4 py-3">
        {canEdit ? (
          <StatusMenu
            status={booking.status}
            pending={pending}
            onConfirm={() => setStatus("confirmed")}
            onCancel={() => setStatus("cancelled")}
            onDelete={remove}
          />
        ) : (
          <span className="text-sm font-medium text-[var(--gn-palette-3)]">{STATUS_LABEL[booking.status]}</span>
        )}
      </td>
    </tr>
  );
}

export function BookingsTable({ bookings: initial, role }: { bookings: BookingRow[]; role: ProfileRole }) {
  const [bookings, setBookings] = useState(initial);
  const canEdit = role === "admin";

  if (bookings.length === 0) {
    return (
      <div className="admin-card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]"><CalendarX2 className="h-6 w-6" /></span>
        <div>
          <p className="font-bold text-[var(--gn-palette-3)]">Aún no hay reservas</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--gn-palette-5)]">Cuando alguien reserve una salida desde el sitio público, aparecerá aquí para confirmarla o rechazarla.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/5 text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Salida</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Personas</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <Row
              key={b.id}
              booking={b}
              canEdit={canEdit}
              onChanged={(next) =>
                setBookings((prev) => (next ? prev.map((x) => (x.id === b.id ? next : x)) : prev.filter((x) => x.id !== b.id)))
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
