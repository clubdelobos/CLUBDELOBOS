"use client";

import { trackEvent } from "@/app/actions/analytics";

export type AnalyticsEventType = "page_view" | "tour_click" | "cta_click" | "social_click";

export const STAFF_FLAG_KEY = "lobos:staff";

/**
 * True once this browser has visited the admin panel (StaffFlag sets it), or
 * when running on localhost. Those visits are the team's own and must not
 * count toward public traffic.
 */
function isStaffOrDev(): boolean {
  try {
    if (window.localStorage.getItem(STAFF_FLAG_KEY) === "1") return true;
  } catch {
    /* private mode — ignore */
  }
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

/** Fire-and-forget: never awaited by the caller, never throws into the UI. */
export function track(eventType: AnalyticsEventType, label?: string) {
  if (typeof window === "undefined") return;
  if (isStaffOrDev()) return;
  void trackEvent({ eventType, path: window.location.pathname, label }).catch(() => {});
}
