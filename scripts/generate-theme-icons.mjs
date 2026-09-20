/**
 * Regenerates the per-theme favicon / app icons in public/brand/lobos/themes/.
 * Each site palette (src/lib/site-palettes.ts) gets its own set: the wolf mark
 * in white on that palette's primary colour (palette 1). `app/layout.tsx` picks
 * the set that matches the palette selected in Ajustes, so the icon Google shows
 * next to the site in search results follows the theme.
 *
 * Run after adding/changing a palette or the logo:  node scripts/generate-theme-icons.mjs
 * (uses `sharp`, which ships with Next.js — it is not a direct dependency.)
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const BRAND = path.join(ROOT, "public/brand/lobos");

// Keep in sync with SITE_PALETTES[*].colors[1].
const THEMES = { lobos: "#2b2f3a", original: "#235652", volcan: "#3a2620" };
const OUTPUTS = { "favicon-32.png": 32, "favicon-48.png": 48, "icon-192.png": 192, "apple-touch-icon.png": 180 };
const MARK_RATIO = 0.68;

const mark = await sharp(path.join(BRAND, "logo-white-1024.png")).trim().png().toBuffer();

for (const [theme, background] of Object.entries(THEMES)) {
  const dir = path.join(BRAND, "themes", theme);
  await mkdir(dir, { recursive: true });
  for (const [name, size] of Object.entries(OUTPUTS)) {
    const inner = Math.round(size * MARK_RATIO);
    const resized = await sharp(mark).resize(inner, inner, { fit: "inside" }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: resized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(dir, name));
  }
  console.log("ok", theme, background);
}
