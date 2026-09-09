import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { IDLE_COOKIE } from "@/lib/auth/idle";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Plain-navigation sign-out. The client idle watcher sends the browser here
 * with `window.location.assign("/admin/logout?reason=idle")` instead of calling
 * a Server Action directly — a real navigation reliably applies the
 * `Set-Cookie` that clears the session, where a bare Server Action call from an
 * effect does not (its response is never processed, so the redirect and the
 * cookie clearing are both dropped and the stale session rides on).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(IDLE_COOKIE);

  const reason = request.nextUrl.searchParams.get("reason");
  const dest = new URL("/admin/login", request.nextUrl.origin);
  if (reason === "idle") dest.searchParams.set("reason", "idle");
  return NextResponse.redirect(dest);
}
