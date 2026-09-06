"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIpFrom } from "@/lib/net/client-ip";
import { createClient } from "@/lib/supabase/server";

const EventSchema = z.object({
  eventType: z.enum(["page_view", "tour_click", "cta_click", "social_click"]),
  path: z.string().min(1).max(300),
  label: z.string().max(200).optional(),
});

function deviceFromUA(ua: string): string {
  return /mobile|android|iphone|ipad|ipod|windows phone/i.test(ua) ? "móvil" : "escritorio";
}

/**
 * Public, fire-and-forget telemetry — same anon-insert-only RLS shape as the
 * booking form. Best-effort: a malformed payload or a DB hiccup silently
 * drops the event instead of surfacing an error to the visitor.
 *
 * `country`/`device` come from the platform edge headers (populated on
 * Vercel). If 0006_analytics_meta.sql hasn't been applied yet, the insert
 * with those fields fails and we retry with just the base columns.
 */
export async function trackEvent(raw: unknown): Promise<void> {
  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return;

  const h = await headers();
  const country = h.get("x-vercel-ip-country") || null;
  const device = deviceFromUA(h.get("user-agent") ?? "");

  const supabase = await createClient();

  // Per-IP flood guard. 120 events/minute is far above real browsing but
  // stops a script pumping the endpoint. Fails open if 0009 isn't deployed.
  const { data: allowed, error: rlError } = await supabase.rpc("rate_limit_hit", {
    p_key: `analytics:${clientIpFrom(h)}`,
    p_limit: 120,
    p_window_seconds: 60,
  });
  if (!rlError && allowed === false) return;

  const base = {
    event_type: parsed.data.eventType,
    path: parsed.data.path,
    label: parsed.data.label || null,
  };

  const { error } = await supabase.from("analytics_events").insert({ ...base, country, device });
  if (error) await supabase.from("analytics_events").insert(base);
}
