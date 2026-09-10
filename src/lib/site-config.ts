/** Single source of truth for the canonical site URL — used by metadata,
 * the sitemap, robots.txt, and structured data, so they can never drift.
 *
 * `NEXT_PUBLIC_SITE_URL` should be the deployed origin (e.g.
 * https://clubdelobos.vercel.app or the custom domain). An empty or malformed
 * value falls back to a valid URL instead of crashing the build at
 * `new URL(SITE_URL)` in `app/layout.tsx` — Vercel's env UI stores unset
 * fields as "" (not undefined), which `??` would let through.
 */
const FALLBACK_SITE_URL = "https://lobos-chi.vercel.app";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return FALLBACK_SITE_URL;
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Club de Lobos";
