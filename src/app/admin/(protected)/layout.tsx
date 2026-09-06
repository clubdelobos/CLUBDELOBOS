import { requireRole } from "@/lib/auth/dal";
import { AdminShellNav } from "@/components/admin/AdminShellNav";
import { IdleLogout } from "@/components/admin/IdleLogout";
import { StaffFlag } from "@/components/admin/StaffFlag";
import { getSiteSettings } from "@/lib/queries/site-content";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Palette comes straight from site_settings (the same source the public
  // site reads), so the panel always matches whatever palette is live —
  // no dependency on a cookie that can drift.
  const [session, settings] = await Promise.all([requireRole(["admin", "worker"]), getSiteSettings()]);
  const palette = settings.palette;

  return (
    <div
      id="admin-shell"
      className="min-h-dvh bg-[var(--gn-palette-8)] lg:grid lg:grid-cols-[252px_minmax(0,1fr)]"
      style={{
        "--gn-palette-1": palette[1],
        "--gn-palette-2": palette[2],
        "--gn-palette-3": palette[3],
        "--gn-palette-5": palette[5],
        "--gn-palette-7": palette[7],
        "--gn-palette-8": palette[8],
      } as React.CSSProperties}
    >
      <StaffFlag />
      <IdleLogout />
      <AdminShellNav role={session.role} email={session.email ?? null} />

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-12">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
