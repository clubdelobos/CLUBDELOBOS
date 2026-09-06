"use client";

import { useEffect } from "react";
import { STAFF_FLAG_KEY } from "@/lib/analytics/track";

/**
 * Mounted once in the admin layout. Marks this browser as staff so the public
 * analytics tracker stops counting the team's own visits. Cleared by the
 * visitor wiping site data; harmless if it lingers.
 */
export function StaffFlag() {
  useEffect(() => {
    try {
      window.localStorage.setItem(STAFF_FLAG_KEY, "1");
    } catch {
      /* private mode — nothing to do */
    }
  }, []);
  return null;
}
