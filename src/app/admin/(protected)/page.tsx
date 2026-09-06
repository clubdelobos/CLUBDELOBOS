import { requireRole } from "@/lib/auth/dal";
import { getDashboardMetrics } from "@/lib/queries/analytics";
import { HourlyChart, TourClicksPanel, VisitsChart } from "./VisitsChart";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="admin-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[var(--gn-palette-3)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--gn-palette-5)]">{hint}</p> : null}
    </div>
  );
}

function RankedList({ title, items, emptyLabel }: { title: string; items: { label: string; count: number }[]; emptyLabel: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="admin-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gn-palette-5)]">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[var(--gn-palette-3)]">{item.label}</span>
                <span className="shrink-0 text-xs font-bold text-[var(--gn-palette-1)]">{item.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--gn-palette-1)]/10">
                <div className="h-full rounded-full bg-[var(--gn-palette-1)]/45" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeviceSplit({ mobile, desktop }: { mobile: number; desktop: number }) {
  const total = mobile + desktop;
  const mobilePct = total ? Math.round((mobile / total) * 100) : 0;
  return (
    <div className="admin-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--gn-palette-5)]">Dispositivo · 7 días</p>
      {total === 0 ? (
        <p className="mt-3 text-sm text-[var(--gn-palette-5)]">Sin datos todavía.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full">
            <div className="bg-[var(--gn-palette-1)]" style={{ width: `${mobilePct}%` }} />
            <div className="bg-[var(--gn-palette-1)]/30" style={{ width: `${100 - mobilePct}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="font-semibold text-[var(--gn-palette-3)]">Móvil · {mobile} ({mobilePct}%)</span>
            <span className="text-[var(--gn-palette-5)]">Escritorio · {desktop}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gn-palette-1)]">Club de Lobos</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Panel de contenido</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gn-palette-5)]">
        Resumen del sitio y su tráfico. Tus propias visitas mientras administras no se cuentan.
      </p>

      {!metrics.available ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
          Las métricas todavía no están activas: falta aplicar <code className="rounded bg-amber-100 px-1">supabase/migrations/0003_analytics.sql</code> en el editor SQL de Supabase.
        </p>
      ) : !metrics.geoAvailable ? (
        <p className="mt-6 rounded-xl border border-[var(--admin-line)] bg-[var(--admin-surface-sunken)] p-3 text-xs font-semibold leading-5 text-[var(--gn-palette-5)]">
          Para ver país y dispositivo aplica <code className="rounded bg-black/5 px-1">supabase/migrations/0006_analytics_meta.sql</code>. Los datos empiezan a acumularse desde el despliegue.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitas hoy" value={metrics.visitsToday} />
        <StatCard label="Visitas · 7 días" value={metrics.visits7d} />
        <StatCard label="Reservas pendientes" value={metrics.pendingBookings} hint="Por confirmar o rechazar" />
        <StatCard label="Salidas publicadas" value={metrics.publishedTours} hint="Visibles en la portada" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <VisitsChart dailyVisits={metrics.dailyVisits} weekdays={metrics.weekdays} />
        <HourlyChart hourly={metrics.hourly} />
        <TourClicksPanel tours={metrics.tourSeries} weekdays={metrics.weekdays} />
        <RankedList title="Botones más usados · 7 días" items={metrics.topCtas} emptyLabel="Sin clics todavía." />
        <RankedList title="Visitas por país · 7 días" items={metrics.topCountries} emptyLabel="Sin datos de país todavía." />
        <DeviceSplit mobile={metrics.deviceSplit.mobile} desktop={metrics.deviceSplit.desktop} />
        <StatCard label="Clics en redes sociales · 7 días" value={metrics.socialClicks7d} />
      </div>
    </div>
  );
}
