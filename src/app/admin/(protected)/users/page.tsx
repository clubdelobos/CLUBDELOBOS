import { requireRole } from "@/lib/auth/dal";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { CreateUserForm } from "./CreateUserForm";
import { UsersTable, type StaffRow } from "./UsersTable";

export default async function UsersPage() {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createServiceRoleClient();
  const [{ data: profiles }, authList] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  const emailById = new Map((authList.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const rows: StaffRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: emailById.get(p.id) ?? "",
    role: p.role,
  }));

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Usuarios</h1>
      <p className="mt-1 text-sm text-[var(--gn-palette-5)]">
        Crea cuentas para tu equipo. Los administradores pueden editar todo el sitio; los
        trabajadores únicamente ven la lista de reservas.
      </p>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <UsersTable rows={rows} />
        <CreateUserForm />
      </div>
    </div>
  );
}
