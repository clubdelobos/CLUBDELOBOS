import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth/dal";
import { AdminShellNav } from "@/components/admin/AdminShellNav";
import { SITE_PALETTES, type SitePaletteId } from "@/lib/site-palettes";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([requireRole(["admin", "worker"]), cookies()]);
  const requestedPalette = cookieStore.get("lobos-site-palette")?.value;
  const paletteId: SitePaletteId = requestedPalette && requestedPalette in SITE_PALETTES
    ? requestedPalette as SitePaletteId
    : "original";
  const palette = SITE_PALETTES[paletteId].colors;

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
      <AdminShellNav role={session.role} email={session.email ?? null} />

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-12">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
