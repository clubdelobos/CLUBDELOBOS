import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { NavLinksManager, type NavLinkRow } from "./NavLinksManager";

export default async function NavPage() {
  const linksPromise = createClient().then((supabase) =>
    supabase.from("nav_links").select("id, label, href, is_active, sort_order").order("sort_order"),
  );
  const [, { data }] = await Promise.all([requireRole(["admin"]), linksPromise]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Menú del sitio</h1>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gn-palette-5)]">
        Enlaces del menú principal, en el encabezado y el pie de página. Usa las flechas para
        cambiar el orden; desmarca &quot;Visible&quot; para ocultar uno sin borrarlo.
      </p>
      <div className="mt-6">
        <NavLinksManager links={(data ?? []) as NavLinkRow[]} />
      </div>
    </div>
  );
}
