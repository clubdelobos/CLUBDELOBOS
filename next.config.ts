import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` — that's for self-hosted Node/Docker. Vercel
  // builds and traces its own serverless output, and standalone mode
  // conflicts with it (missing .next/next-server.js.nft.json at deploy time).

  experimental: {
    // Turbopack's on-disk build cache (default-on since 16.3) was shipping a
    // stale compiled globals.css on Vercel — new animation/utility rules in
    // that file weren't invalidating the cached CSS artifact, so keyframes
    // like the marquee / fact-icon idle loops and the pinned-header styles
    // never reached production. Compiling CSS fresh each build is a small
    // cost for a correct stylesheet.
    turbopackFileSystemCacheForBuild: false,

    // Keep a visited route's RSC payload in the client router cache for a
    // short while, so bouncing between admin sections (Ajustes ↔ Portada ↔ …)
    // is instant on the second visit instead of re-fetching every time.
    staleTimes: {
      dynamic: 45,
      static: 300,
    },
  },

  images: {
    remotePatterns: [
      // Supabase Storage — admin-uploaded logos, tour photos, gallery images.
      // Wildcarded so it keeps working across any Supabase project ref.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  async headers() {
    // Content-Security-Policy is shipped Report-Only for now: it surfaces
    // violations in the browser console / a report collector without breaking
    // the site, so it can be tightened and then promoted to an enforcing
    // `Content-Security-Policy` header once the reports come back clean.
    // `script-src`/`style-src` keep 'unsafe-inline' because the Next.js App
    // Router injects inline bootstrap + flight scripts and inline style
    // attributes (e.g. the admin palette CSS variables) with no nonce.
    // `next/font` self-hosts Montserrat at build time, so no font CDN is
    // needed; `img-src`/`connect-src` cover Supabase Storage + Auth + Realtime.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "form-action 'self'",
      "frame-src 'none'",
      // `upgrade-insecure-requests` is intentionally omitted: it is ignored in
      // Report-Only mode. Add it back when this is promoted to an enforcing
      // `Content-Security-Policy` header.
    ].join("; ");

    const baseHeaders = [
      // Clickjacking: enforced regardless of the Report-Only CSP below.
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    // The CSP is production-only: `next dev` (Turbopack HMR) evaluates modules
    // with `eval`, which a realistic `script-src` can't allow, so in dev the
    // header would only spew false-positive violations. Production bundles
    // contain no `eval`.
    if (process.env.NODE_ENV === "production") {
      baseHeaders.push({ key: "Content-Security-Policy-Report-Only", value: csp });
    }

    return [{ source: "/:path*", headers: baseHeaders }];
  },
};

export default nextConfig;
