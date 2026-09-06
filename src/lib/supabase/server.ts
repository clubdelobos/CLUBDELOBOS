import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { assertPublishableKey } from "@/lib/supabase/guard";
import type { Database } from "@/lib/supabase/types";

assertPublishableKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Server-side Supabase client — for Server Components, Server Actions, and
 * Route Handlers. Reads the anon key only; RLS decides what it can see.
 *
 * Call this fresh in every request scope (don't cache the client itself —
 * `cookies()` is request-scoped and this factory reads it each time).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — safe to ignore because
            // `src/proxy.ts` refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}

/**
 * Service-role Supabase client — bypasses RLS entirely. SERVER-ONLY.
 *
 * Only ever call this from inside a role-checked Server Action (after
 * `requireRole(["admin"])`), for the handful of operations RLS can't express:
 * creating auth users (worker accounts) and minting Storage signed upload
 * URLs. Never import this module from a "use client" file.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It is required for account creation and signed uploads, and must be a server-only (non-NEXT_PUBLIC) variable.",
    );
  }
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } },
  );
}
