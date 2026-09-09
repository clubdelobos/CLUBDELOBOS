/**
 * Shared constants for the admin idle-timeout, used by both the server-side
 * enforcement in `src/lib/supabase/proxy-session.ts` (the guarantee) and the
 * client-side warning UI in `src/components/admin/IdleLogout.tsx` (the nicety).
 *
 * The server piece is what actually keeps a walked-away-from session from
 * being usable: every `/admin/*` request carries the `IDLE_COOKIE` timestamp,
 * the Proxy refreshes it on genuine activity and, when it is older than
 * `IDLE_LIMIT_MS`, clears the Supabase auth cookies and bounces to
 * `/admin/login?reason=idle`. That works with JS disabled, on a frozen mobile
 * tab, after a bfcache reload — anywhere a timer in the page would not.
 */
export const IDLE_LIMIT_MS = 15 * 60 * 1000;

/** How long before the deadline the "Seguir conectado" prompt appears. */
export const IDLE_WARN_MS = 60 * 1000;

/** httpOnly cookie holding the epoch-ms of the last observed admin activity. */
export const IDLE_COOKIE = "lobos-admin-seen";
