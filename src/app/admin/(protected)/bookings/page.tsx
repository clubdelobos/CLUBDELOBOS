import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { BookingsTable, type BookingRow } from "./BookingsTable";

/**
 * Both roles reach this page — the worker's "únicamente podrá ver" is
 * enforced at the data layer (RLS grants worker SELECT-only on `bookings`,
 * see `supabase/migrations/0001_init.sql`) and by BookingsTable hiding the
 * action buttons when role !== "admin".
 */
export default async function BookingsPage() {
  const bookingsPromise = createClient().then((supabase) => supabase
    .from("bookings")
    .select("id, customer_name, email, phone, requested_date, num_people, status, created_at, tours(title)")
    .order("created_at", { ascending: false }));
  const [session, { data, error }] = await Promise.all([
    requireRole(["admin", "worker"]),
    bookingsPromise,
  ]);

  const bookings: BookingRow[] = (data ?? []).map((b) => ({
    id: b.id,
    customer_name: b.customer_name,
    email: b.email,
    phone: b.phone,
    requested_date: b.requested_date,
    num_people: b.num_people,
    status: b.status,
    created_at: b.created_at,
    tourTitle: (b.tours as unknown as { title: string } | null)?.title ?? "—",
  }));

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Reservas</h1>
      <p className="mt-1 text-sm text-[var(--gn-palette-5)]">
        {session.role === "worker"
          ? "Puedes ver las reservas y los datos de los clientes. Solo un administrador puede confirmarlas o cancelarlas."
          : "Todas las reservas recibidas desde el sitio público."}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar las reservas. Recarga la página e inténtalo de nuevo.</p>
      ) : null}

      <div className="mt-6">
        <BookingsTable bookings={bookings} role={session.role} />
      </div>
    </div>
  );
}
