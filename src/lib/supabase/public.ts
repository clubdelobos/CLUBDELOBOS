import "server-only";
import { createClient } from "@supabase/supabase-js";
import { assertPublishableKey } from "@/lib/supabase/guard";
import type { Database } from "@/lib/supabase/types";

assertPublishableKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

/** Stateless anonymous client for public, cacheable site content. */
let publicClient: ReturnType<typeof createClient<Database>> | undefined;

export function createPublicClient() {
  publicClient ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return publicClient;
}
