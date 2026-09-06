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
};

export default nextConfig;
