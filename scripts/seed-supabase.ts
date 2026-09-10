/**
 * One-time seed: reads the site's current content verbatim from
 * `content.ts` and inserts it into Supabase.
 *
 * `site_settings` (update) and `tours`/`content_blocks` (upsert on a natural
 * unique key) are safe to re-run. `nav_links`, `hero_slides`, `gallery_items`
 * and `reviews` have no natural unique column — those four are meant to run
 * exactly once against an empty database; re-running this script after the
 * admin panel has been used would duplicate them.
 *
 * `content.ts` itself is untouched and stays in the repo afterward as an
 * unused rollback reference (see the approved plan).
 *
 * Usage:
 *   npx tsx scripts/seed-supabase.ts
 *
 * Requires (from `.env.local` or the shell environment):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role — bypasses RLS; never expose client-side)
 */
import { createClient } from "@supabase/supabase-js";
import {
  CAMPING,
  EMAIL,
  FOOTER,
  FOTOGRAFIAS,
  GALLERY,
  GUIAS,
  HERO_SLIDES,
  NAV_LINKS,
  PHONE_HREF,
  PHONE_LABEL,
  PRODUCTS,
  REVIEWS,
  REVIEWS_SUMMARY,
  SOCIAL_LINKS,
} from "../src/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/content";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist yet in CI — fall back to whatever is already in the environment.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

/** Real, downloaded-file dimensions (JPEG SOF marker, verified 1440×713 for all four). */
const HERO_IMAGE_SIZE = { w: 1440, h: 713 };
/** WooCommerce `woocommerce_thumbnail` size — matches the fixed width/height ProductCard passes to next/image. */
const TOUR_IMAGE_SIZE = { w: 600, h: 360 };

/** The six tours' "Próxima salida" strings, parsed into real dates by hand (only six, known values). */
const TOUR_DEPARTURES: Record<string, string[]> = {
  "tour-farallones-sutatausa": ["2026-09-12"],
  "tour-lagunas-siecha": ["2026-09-12"],
  "tour-tatacoa": ["2026-09-19", "2026-09-20"],
  "tour-chingaza-kids": ["2026-09-19"],
  "tour-camping-chingaza": ["2026-09-19", "2026-09-20"],
  "tour-penas-blancas": ["2026-09-20"],
};

async function main() {
  console.log("Seeding site_settings...");
  const { error: settingsErr } = await supabase
    .from("site_settings")
    .update({
      logo_header_url: "/brand/lobos/logo-white-640.png",
      logo_footer_url: "/brand/lobos/logo-white-1024.png",
      favicon_url: "/brand/lobos/favicon-32.png",
      phone_label: PHONE_LABEL,
      phone_href: PHONE_HREF,
      email: EMAIL,
      address: "El Salvador",
      social_facebook_url: SOCIAL_LINKS.find((s) => s.network === "facebook")?.href,
      social_instagram_url: SOCIAL_LINKS.find((s) => s.network === "instagram")?.href,
      social_youtube_url: SOCIAL_LINKS.find((s) => s.network === "youtube")?.href,
      palette_1: "#235652",
      palette_2: "#183f3c",
      palette_3: "#373435",
      palette_5: "#686c6a",
      palette_7: "#f4f2be",
      palette_8: "#fbfaec",
      footer_registro: FOOTER.registro,
      footer_copyright: FOOTER.copyright,
      footer_credit_label: FOOTER.designer.label,
      footer_credit_href: FOOTER.designer.href ?? null,
    })
    .eq("id", 1);
  if (settingsErr) throw settingsErr;

  console.log("Seeding nav_links...");
  const { error: navErr } = await supabase.from("nav_links").insert(
    NAV_LINKS.map((link, i) => ({ label: link.label, href: link.href, is_active: true, sort_order: i })),
  );
  if (navErr) throw navErr;

  console.log("Seeding hero_slides...");
  const { error: heroErr } = await supabase.from("hero_slides").insert(
    HERO_SLIDES.map((slide, i) => ({
      image_url: slide.image,
      image_w: HERO_IMAGE_SIZE.w,
      image_h: HERO_IMAGE_SIZE.h,
      heading: slide.heading,
      description: slide.description,
      button_label: slide.buttonLabel,
      href: slide.href,
      sort_order: i,
    })),
  );
  if (heroErr) throw heroErr;

  console.log("Seeding tours...");
  const { error: toursErr } = await supabase.from("tours").upsert(
    PRODUCTS.map((p, i) => {
      return {
        slug: p.id,
        title: p.title,
        price: p.price,
        currency_symbol: p.currencySymbol,
        departure_dates: TOUR_DEPARTURES[p.id],
        images: [
          { url: p.image, width: TOUR_IMAGE_SIZE.w, height: TOUR_IMAGE_SIZE.h },
          { url: p.hoverImage, width: TOUR_IMAGE_SIZE.w, height: TOUR_IMAGE_SIZE.h },
        ],
        button_label: p.buttonLabel,
        sort_order: i,
        category: p.category,
        subcategory: p.subcategory,
      };
    }),
    { onConflict: "slug" },
  );
  if (toursErr) throw toursErr;

  console.log("Seeding content_blocks...");
  const { error: blocksErr } = await supabase.from("content_blocks").upsert([
    { key: "guias", data: GUIAS },
    { key: "camping", data: CAMPING },
    { key: "fotografias", data: FOTOGRAFIAS },
  ]);
  if (blocksErr) throw blocksErr;

  console.log("Seeding gallery_items...");
  const { error: galleryErr } = await supabase.from("gallery_items").insert(
    GALLERY.map((item, i) => ({
      image_url: item.thumb,
      image_w: item.width,
      image_h: item.height,
      title: item.title,
      sort_order: i,
    })),
  );
  if (galleryErr) throw galleryErr;

  console.log("Seeding reviews...");
  const { error: reviewsErr } = await supabase.from("reviews").insert(
    REVIEWS.map((r, i) => ({
      author: r.author,
      review_date: r.isoDate,
      rating: r.rating,
      body_text: r.text,
      sort_order: i,
    })),
  );
  if (reviewsErr) throw reviewsErr;

  console.log(
    `Done. Seeded 1 site_settings row, ${NAV_LINKS.length} nav links, ${HERO_SLIDES.length} hero slides, ` +
      `${PRODUCTS.length} tours, 3 content blocks, ${GALLERY.length} gallery items, ${REVIEWS.length} reviews. ` +
      `Reviews summary (${REVIEWS_SUMMARY.rating}, ${REVIEWS_SUMMARY.countLabel}) is not seeded — it has no admin ` +
      `screen yet in this phase and stays a static constant in content.ts for now.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
