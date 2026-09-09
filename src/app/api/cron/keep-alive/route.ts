import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * Keeps the Supabase project from being auto-paused for inactivity.
 *
 * A Supabase free-tier project pauses after 7 days with no database/API
 * traffic. This route runs one trivial authenticated query, and `vercel.json`
 * triggers it once a day (`0 6 * * *`), so the project always looks active and
 * never pauses — well inside the 7-day window even if a run is skipped.
 *
 * Auth: when `CRON_SECRET` is set, Vercel Cron sends it as
 * `Authorization: Bearer <secret>` and anything else is rejected. If it is not
 * set the route still works (so keeping the project awake never depends on an
 * env var being remembered) — it only does a harmless read either way.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const supabase = createPublicClient();
  const { error } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    ms: Date.now() - startedAt,
  });
}
