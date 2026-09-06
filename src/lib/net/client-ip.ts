import "server-only";

/**
 * Best-effort client IP for rate-limiting keys. On Vercel the platform sets
 * `x-forwarded-for` (client first) and `x-real-ip`; locally these may be
 * absent, in which case every caller shares the "unknown" bucket — fine, the
 * limit just applies globally in dev.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
