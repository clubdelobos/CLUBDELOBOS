import { createBrowserClient } from "@supabase/ssr";
import { assertPublishableKey } from "@/lib/supabase/guard";
import type { Database } from "@/lib/supabase/types";

assertPublishableKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Browser-side Supabase client — for Client Components only (login form,
 * signed-upload PUT requests). Uses the public anon key; RLS decides what it
 * can see and write.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
