"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIpFrom } from "@/lib/net/client-ip";
import { createClient } from "@/lib/supabase/server";

const BookingSchema = z.object({
  tourId: z.string().uuid(),
  customerName: z.string().min(2, { message: "Escribe tu nombre completo." }).max(200),
  email: z.string().email({ message: "Correo inválido." }),
  phone: z.string().min(7, { message: "Teléfono inválido." }).max(30),
  requestedDate: z.string().min(1, { message: "Elige una fecha." }),
  numPeople: z.number().int().min(1).max(50),
  notes: z.string().max(1000).optional(),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.string().max(0, { message: "" }).optional(),
});

export interface BookingState {
  error?: string;
  success?: boolean;
}

export interface TourBookingInfo {
  tourId: string;
  title: string;
  availableDates: string[];
}

/**
 * Read-only helper for the "salidas guardadas" list — lets the cart open the
 * booking form for a saved salida without the client having stored its id or
 * date list. Only ever returns published tours.
 */
export async function getTourBookingInfo(slug: string): Promise<TourBookingInfo | null> {
  if (typeof slug !== "string" || !slug || slug.length > 200) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tours")
    .select("id, title, departure_dates")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!data) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    tourId: data.id,
    title: data.title,
    availableDates: data.departure_dates.filter((d: string) => d >= today),
  };
}

/**
 * Public Server Action — the only path a visitor has to write to `bookings`.
 * One choke point for: validation, a honeypot check, and per-email
 * throttling. RLS additionally enforces `status = 'pending'` at the DB level
 * regardless of what this function sends, so a compromised client still
 * can't create a pre-confirmed booking.
 */
export async function createBooking(raw: unknown): Promise<BookingState> {
  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  // Honeypot tripped — pretend success so the bot doesn't learn anything, but insert nothing.
  if (d.website) return { success: true };

  const supabase = await createClient();

  // Per-IP guard: at most 8 booking attempts an hour from one address, on top
  // of the per-email check below. Fails open if 0009 isn't deployed.
  const ip = clientIpFrom(await headers());
  const { data: ipAllowed, error: ipRlError } = await supabase.rpc("rate_limit_hit", {
    p_key: `booking:${ip}`,
    p_limit: 8,
    p_window_seconds: 3600,
  });
  if (!ipRlError && ipAllowed === false) {
    return { error: "Recibimos demasiadas solicitudes desde tu conexión. Intenta de nuevo más tarde." };
  }

  // The public form only ever renders a <select> of the tour's configured
  // dates, but that's a client-side constraint — re-check it here so a
  // hand-crafted request can't book an arbitrary date the admin never set.
  const { data: tour } = await supabase.from("tours").select("departure_dates").eq("id", d.tourId).maybeSingle();
  if (!tour || !tour.departure_dates.includes(d.requestedDate)) {
    return { error: "Esa fecha ya no está disponible para esta salida." };
  }

  // Basic throttle: refuse a second request from the same email within 2
  // minutes. Runs through a SECURITY DEFINER function (0008) because the anon
  // role has no SELECT policy on `bookings` — a direct `.from("bookings")`
  // count here always returned 0. Fails open if the function isn't deployed
  // yet (the honeypot + DB constraints still apply).
  const { data: recentCount, error: throttleError } = await supabase.rpc("recent_booking_count", {
    p_email: d.email,
  });
  if (throttleError) {
    console.error("recent_booking_count rpc failed:", throttleError.message);
  } else if (typeof recentCount === "number" && recentCount > 0) {
    return { error: "Ya recibimos tu solicitud. Te contactaremos pronto — intenta de nuevo en unos minutos." };
  }

  const { error } = await supabase.from("bookings").insert({
    tour_id: d.tourId,
    customer_name: d.customerName,
    email: d.email,
    phone: d.phone,
    requested_date: d.requestedDate,
    num_people: d.numPeople,
    notes: d.notes || null,
    // Explicit, not left to the column DEFAULT: the anon INSERT policy's
    // `WITH CHECK (status = 'pending')` only matches against the value
    // actually sent in the PostgREST payload, not the column's default.
    status: "pending" as const,
  });

  if (error) {
    console.error("createBooking insert failed:", error.message);
    return { error: "No se pudo enviar la reserva. Intenta de nuevo." };
  }
  return { success: true };
}
