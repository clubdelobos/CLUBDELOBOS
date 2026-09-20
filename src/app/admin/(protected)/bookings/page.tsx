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
  const dataPromise = createClient().then(async (supabase) => {
    // `*` (not a column list) so the page keeps loading before 0012's
    // payment_method column exists. The bank accounts feed the WhatsApp
    // message; a missing table (pre-0012) just yields an empty list.
    const [bookings, accounts] = await Promise.all([
      supabase.from("bookings").select("*, tours(title)").order("created_at", { ascending: false }),
      supabase.from("payment_accounts").select("bank, account_type, account_number, holder").order("sort_order").order("created_at"),
    ]);
    return { bookings, accounts };
  });
  const [session, { bookings: { data, error }, accounts }] = await Promise.all([
    requireRole(["admin", "worker"]),
    dataPromise,
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
    notes: b.notes ?? null,
    payment_method: b.payment_method ?? null,
    tourTitle: (b.tours as unknown as { title: string } | null)?.title ?? "—",
  }));

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Reservas</h1>
      <p className="mt-1 text-sm text-[var(--gn-palette-5)]">
        {session.role === "worker"
          ? "Puedes ver las reservas y los datos de los clientes. Solo un administrador puede confirmarlas o cancelarlas."
          : "Todas las reservas recibidas desde el sitio público. Usa el botón WhatsApp para escribirle al cliente con el mensaje ya listo."}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar las reservas. Recarga la página e inténtalo de nuevo.</p>
      ) : null}

      <div className="mt-6">
        <BookingsTable bookings={bookings} role={session.role} bankAccounts={accounts.data ?? []} />
      </div>
    </div>
  );
}
