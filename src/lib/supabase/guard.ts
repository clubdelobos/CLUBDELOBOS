/**
 * Trip-wire for the single worst env-var mistake: putting the Supabase
 * SERVICE ROLE key (which bypasses Row Level Security) into a variable that
 * ships to the browser. Called wherever the "public" key is read.
 *
 * Legacy Supabase keys are JWTs whose payload carries `"role":"anon"` vs
 * `"role":"service_role"`. Newer publishable/secret keys aren't JWTs — there's
 * nothing to inspect, so this is a no-op for them (the naming convention
 * `sb_publishable_…` / `sb_secret_…` is the safeguard there).
 */
export function assertPublishableKey(key: string | undefined, varName: string): void {
  if (!key) return;
  const segments = key.split(".");
  if (segments.length !== 3) return; // not a JWT — nothing to check

  try {
    const json = segments[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      typeof atob === "function"
        ? atob(json)
        : Buffer.from(json, "base64").toString("utf8"),
    ) as { role?: string };

    if (payload.role === "service_role") {
      throw new Error(
        `${varName} holds a SERVICE ROLE key. It bypasses RLS and must never reach the browser — put the anon / publishable key here instead.`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("SERVICE ROLE")) throw error;
    // Undecodable payload — treat as "not a legacy JWT", nothing to assert.
  }
}
