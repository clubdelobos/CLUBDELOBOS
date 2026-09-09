import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { IDLE_COOKIE, IDLE_LIMIT_MS } from "@/lib/auth/idle";
import type { Database } from "@/lib/supabase/types";

/**
 * Optimistic, cookie-only check used by `src/proxy.ts`. Per the Next.js 16
 * auth guide, Proxy must stay cheap (it runs on every request, including
 * prefetches) — it only redirects unauthenticated visitors away from
 * `/admin/*`. It does NOT check role; the real, DB-backed role check lives in
 * `src/lib/auth/dal.ts` and runs inside every protected Server
 * Component/Action/Route Handler instead.
 *
 * It also enforces the admin **idle timeout** here rather than in the page:
 * a `lobos-admin-seen` cookie carries the epoch-ms of the last genuine
 * activity, this refreshes it on every non-prefetch admin request, and once it
 * is older than 15 minutes the Supabase auth cookies are cleared and the
 * request is redirected to `/admin/login?reason=idle`. Doing it at this layer
 * is the only way it holds up when the page's own timer can't run — JS
 * disabled, a suspended mobile tab, a bfcache restore.
 *
 * Uses `supabase.auth.getClaims()` so the signed JWT can normally be verified
 * against Supabase's cached public keys without a round trip to Auth.
 */
export async function refreshSessionAndGuard(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const isLogoutRoute = pathname === "/admin/logout";
  const isAdminRoute = pathname.startsWith("/admin");

  // A prefetch (link hover / viewport) is the router being eager, not the user
  // doing something — it must not count as activity, or the timer never runs down.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch";

  if (isAdminRoute && !isLoginRoute && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Idle timeout — only for a real, authenticated admin request (never the
  // logout route, never a prefetch).
  if (authenticated && isAdminRoute && !isLoginRoute && !isLogoutRoute && !isPrefetch) {
    const seenRaw = request.cookies.get(IDLE_COOKIE)?.value;
    const seen = seenRaw ? Number(seenRaw) : NaN;
    const now = Date.now();

    if (Number.isFinite(seen) && now - seen > IDLE_LIMIT_MS) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("reason", "idle");
      const redirect = NextResponse.redirect(url);
      // Drop the Supabase auth cookies and our marker so the bounce lands on a
      // genuinely signed-out state (the JWT stays locally valid for up to an
      // hour otherwise, and Proxy would just wave the next request through).
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith("sb-")) {
          redirect.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
        }
      }
      redirect.cookies.set(IDLE_COOKIE, "", { maxAge: 0, path: "/" });
      return redirect;
    }

    // Still within the window — stamp "now" as the last activity.
    response.cookies.set(IDLE_COOKIE, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
