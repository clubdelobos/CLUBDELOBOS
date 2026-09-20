import { requireRole } from "@/lib/auth/dal";
import { getSiteSettings } from "@/lib/queries/site-content";
import { createClient } from "@/lib/supabase/server";
import type { BankAccountRow } from "./BankAccountsManager";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const [, settings, bankAccounts] = await Promise.all([
    requireRole(["admin"]),
    getSiteSettings(),
    // Admin's own session: RLS lets staff read `payment_accounts`. Before
    // migration 0012 the table is missing and this just yields no rows.
    createClient().then(async (supabase) => {
      const { data } = await supabase
        .from("payment_accounts")
        .select("id, bank, account_type, account_number, holder")
        .order("sort_order")
        .order("created_at");
      return (data ?? []) as BankAccountRow[];
    }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Ajustes del sitio</h1>
      <p className="mt-1 text-sm text-[var(--gn-palette-5)]">
        Marca, contacto, cuentas bancarias, redes sociales, colores y textos generales.
      </p>
      <div className="mt-6">
        <SettingsForm initial={settings} bankAccounts={bankAccounts} googleKeyConfigured={Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim())} />
      </div>
    </div>
  );
}
