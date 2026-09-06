import { SiteHeader } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/SiteHeader";
import { HeroSlider } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/HeroSlider";
import { ProximosDestinos } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/ProximosDestinos";
import { GuiasExpertos } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/GuiasExpertos";
import { CampingSection } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/CampingSection";
import { ReviewsSection } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/ReviewsSection";
import { FotografiasSemana } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/FotografiasSemana";
import { WhatsAppFab } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/WhatsAppFab";
import { SiteFooter } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/SiteFooter";
import { CookieNotice } from "@/components/CookieNotice";
import { PageViewBeacon } from "@/components/analytics/PageViewBeacon";
import {
  getContentBlocks,
  getGalleryItems,
  getHeroSlides,
  getNavLinks,
  getReviews,
  getSiteSettings,
  getTours,
} from "@/lib/queries/site-content";
import { buildOrganizationJsonLd, jsonLdString } from "@/lib/seo/schema";

export const revalidate = 86400;

/**
 * Clone of https://guianatours.com.co/ — now backed by Supabase instead of
 * the static content.ts (which stays in the repo as a seed source / rollback
 * reference, see scripts/seed-supabase.ts).
 *
 * All eight independent reads run in one Promise.all so this never waterfalls.
 * Every read goes through the anon-key client (src/lib/supabase/server.ts),
 * so Row Level Security — not this file — decides what a visitor sees.
 *
 * Page-level layout notes (see docs/research/.../PAGE_TOPOLOGY.md):
 * - The header is an absolute, transparent overlay on the hero (z-index 100).
 *   It is NOT sticky on the original — it scrolls away with the page.
 * - Single native scroll container: no scroll-snap, no smooth-scroll library,
 *   no scroll-driven animation anywhere on the page.
 * - The Camping photo overlaps the section above it by 50px (handled inside
 *   CampingSection).
 */
export default async function Home() {
  const [settings, navLinks, heroSlides, tours, blocks, gallery, reviewsData] = await Promise.all([
    getSiteSettings(),
    getNavLinks(),
    getHeroSlides(),
    getTours(),
    getContentBlocks(),
    getGalleryItems(),
    getReviews(),
  ]);

  return (
    <div
      className="relative w-full"
      style={
        {
          "--gn-palette-1": settings.palette[1],
          "--gn-palette-2": settings.palette[2],
          "--gn-palette-3": settings.palette[3],
          "--gn-palette-5": settings.palette[5],
          "--gn-palette-7": settings.palette[7],
          "--gn-palette-8": settings.palette[8],
        } as React.CSSProperties
      }
    >
      <SiteHeader
        navLinks={navLinks}
        socialLinks={settings.socialLinks}
        phoneLabel={settings.phoneLabel}
        phoneHref={settings.phoneHref}
        logoUrl={settings.logoHeaderUrl}
      />
      <main className="w-full">
        <HeroSlider slides={heroSlides} />
        <ProximosDestinos tours={tours} />
        <GuiasExpertos block={blocks.guias} />
        <CampingSection block={blocks.camping} />
        <ReviewsSection reviews={reviewsData.reviews} summary={reviewsData.summary} />
        <FotografiasSemana block={blocks.fotografias} gallery={gallery} />
      </main>
      <SiteFooter
        navLinks={navLinks}
        socialLinks={settings.socialLinks}
        phoneLabel={settings.phoneLabel}
        phoneHref={settings.phoneHref}
        email={settings.email}
        logoUrl={settings.logoFooterUrl}
        registro={settings.footerRegistro}
        copyright={settings.footerCopyright}
        creditLabel={settings.footerCreditLabel}
        creditHref={settings.footerCreditHref}
      />
      <WhatsAppFab phoneHref={settings.phoneHref} />
      <CookieNotice />
      <PageViewBeacon />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildOrganizationJsonLd(settings)) }} />
    </div>
  );
}
