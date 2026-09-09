import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * No-op endpoint the client idle watcher pings (throttled) while the admin is
 * actively interacting with a page but not navigating. The work happens in
 * Proxy: this path matches `/admin/:path*`, so `refreshSessionAndGuard` runs
 * and re-stamps the `lobos-admin-seen` activity cookie on the response. The
 * body just needs to return fast.
 */
export function GET() {
  return new NextResponse(null, { status: 204 });
}
