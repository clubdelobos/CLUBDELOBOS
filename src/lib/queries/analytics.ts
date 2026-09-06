import "server-only";
import { createClient } from "@/lib/supabase/server";

const DAY_MS = 86_400_000;

export interface DashboardMetrics {
  available: boolean;
  visitsToday: number;
  visits7d: number;
  dailyVisits: { date: string; count: number }[];
  hourly: { hour: number; count: number }[];
  topTours: { label: string; count: number }[];
  topCtas: { label: string; count: number }[];
  topCountries: { label: string; count: number }[];
  deviceSplit: { mobile: number; desktop: number };
  geoAvailable: boolean;
  socialClicks7d: number;
  pendingBookings: number;
  publishedTours: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  SV: "El Salvador", GT: "Guatemala", HN: "Honduras", NI: "Nicaragua", CR: "Costa Rica",
  PA: "Panamá", MX: "México", US: "Estados Unidos", CO: "Colombia", ES: "España",
  PE: "Perú", CL: "Chile", AR: "Argentina", EC: "Ecuador", CA: "Canadá", BR: "Brasil",
};

function countryLabel(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

function startOfDayUTC(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function topLabels(rows: { label: string | null }[] | null | undefined, limit: number) {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    if (!row.label) continue;
    counts.set(row.label, (counts.get(row.label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

const EMPTY_METRICS: DashboardMetrics = {
  available: false,
  visitsToday: 0,
  visits7d: 0,
  dailyVisits: [],
  hourly: [],
  topTours: [],
  topCtas: [],
  topCountries: [],
  deviceSplit: { mobile: 0, desktop: 0 },
  geoAvailable: false,
  socialClicks7d: 0,
  pendingBookings: 0,
  publishedTours: 0,
};

/**
 * Best-effort: `analytics_events` only exists once
 * supabase/migrations/0003_analytics.sql has been applied. Until then this
 * quietly returns zeros (`available: false`) instead of crashing the
 * dashboard for every admin who hasn't run that migration yet.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const todayStart = startOfDayUTC(new Date());
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * DAY_MS);

  const [
    visitsTodayRes,
    pageViewsWithMetaRes,
    tourClicks7dRes,
    ctaClicks7dRes,
    socialClicks7dRes,
    pendingBookingsRes,
    publishedToursRes,
  ] = await Promise.all([
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "page_view").gte("created_at", todayStart.toISOString()),
    supabase.from("analytics_events").select("created_at, country, device").eq("event_type", "page_view").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("analytics_events").select("label").eq("event_type", "tour_click").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("analytics_events").select("label").eq("event_type", "cta_click").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "social_click").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tours").select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  if (visitsTodayRes.error) return EMPTY_METRICS;

  // `country`/`device` only exist after 0006_analytics_meta.sql. If that
  // errored, re-fetch just the guaranteed column so the rest still works.
  const geoAvailable = !pageViewsWithMetaRes.error;
  let rows: { created_at: string; country: string | null; device: string | null }[];
  if (pageViewsWithMetaRes.error) {
    const safe = await supabase
      .from("analytics_events")
      .select("created_at")
      .eq("event_type", "page_view")
      .gte("created_at", sevenDaysAgo.toISOString());
    if (safe.error) return EMPTY_METRICS;
    rows = (safe.data ?? []).map((r) => ({ created_at: r.created_at, country: null, device: null }));
  } else {
    rows = pageViewsWithMetaRes.data ?? [];
  }

  const dailyBuckets = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(sevenDaysAgo.getTime() + i * DAY_MS);
    dailyBuckets.set(day.toISOString().slice(0, 10), 0);
  }
  const hourBuckets = new Array(24).fill(0) as number[];
  const countryCounts = new Map<string, number>();
  let mobile = 0;
  let desktop = 0;

  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (dailyBuckets.has(key)) dailyBuckets.set(key, (dailyBuckets.get(key) ?? 0) + 1);
    hourBuckets[new Date(row.created_at).getUTCHours()] += 1;
    if (row.country) countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
    if (row.device === "móvil") mobile += 1;
    else if (row.device === "escritorio") desktop += 1;
  }

  const topCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => ({ label: countryLabel(code), count }));

  return {
    available: true,
    visitsToday: visitsTodayRes.count ?? 0,
    visits7d: rows.length,
    dailyVisits: [...dailyBuckets.entries()].map(([date, count]) => ({ date, count })),
    hourly: hourBuckets.map((count, hour) => ({ hour, count })),
    topTours: topLabels(tourClicks7dRes.data, 5),
    topCtas: topLabels(ctaClicks7dRes.data, 5),
    topCountries,
    deviceSplit: { mobile, desktop },
    geoAvailable: geoAvailable && (mobile + desktop > 0 || countryCounts.size > 0),
    socialClicks7d: socialClicks7dRes.count ?? 0,
    pendingBookings: pendingBookingsRes.count ?? 0,
    publishedTours: publishedToursRes.count ?? 0,
  };
}
