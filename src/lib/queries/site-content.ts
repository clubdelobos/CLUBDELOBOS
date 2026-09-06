import { createPublicClient } from "@/lib/supabase/public";
import type {
  GalleryItem,
  HeroSlide,
  NavLink,
  ProductCard,
  Review,
  SocialLink,
} from "@/types/guianatours-com-co-e923d4eb";

/**
 * Public-site data layer. Every function here uses the anon-key server
 * client (`createPublicClient()`), so Row Level Security — not application code —
 * decides what a visitor sees (e.g. `is_published = true` filtering on
 * hero_slides/tours/reviews/gallery_items happens inside Postgres).
 *
 * Each function maps DB rows onto the exact prop shapes the section
 * components already destructure (see
 * src/types/guianatours-com-co-e923d4eb.ts) so swapping the data source
 * never required touching component JSX.
 */

const SALIDAS_URL = "/proximas-salidas";

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_ES[m - 1]} ${y}`;
}

/** The soonest date that hasn't passed yet, or the last one if every configured date is already past. */
function nextDepartureDate(dates: string[]): string | null {
  if (dates.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  return dates.find((date) => date >= today) ?? dates[dates.length - 1];
}

export interface SiteSettingsData {
  logoHeaderUrl: string | null;
  logoFooterUrl: string | null;
  faviconUrl: string | null;
  phoneLabel: string;
  phoneHref: string;
  email: string;
  address: string | null;
  socialLinks: SocialLink[];
  palette: { 1: string; 2: string; 3: string; 5: string; 7: string; 8: string };
  footerRegistro: string | null;
  footerCopyright: string;
  footerCreditLabel: string;
  footerCreditHref: string | null;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const supabase = createPublicClient();
  // `select("*")` (not an explicit column list) so a not-yet-applied additive
  // migration — e.g. 0007's social_tiktok_url — can't error the whole query.
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  // Falls back to the original static values if the singleton row is ever
  // missing (should not happen — the migration inserts it), so the public
  // site never hard-crashes on a data problem.
  const socialLinks: SocialLink[] = [];
  if (data?.social_facebook_url) socialLinks.push({ label: "Facebook", href: data.social_facebook_url, network: "facebook" });
  if (data?.social_instagram_url) socialLinks.push({ label: "Instagram", href: data.social_instagram_url, network: "instagram" });
  if (data?.social_tiktok_url) socialLinks.push({ label: "TikTok", href: data.social_tiktok_url, network: "tiktok" });
  if (data?.social_youtube_url) socialLinks.push({ label: "YouTube", href: data.social_youtube_url, network: "youtube" });

  return {
    logoHeaderUrl: data?.logo_header_url ?? "/brand/lobos/logo-white-640.png",
    logoFooterUrl: data?.logo_footer_url ?? "/brand/lobos/logo-white-1024.png",
    faviconUrl: data?.favicon_url ?? null,
    phoneLabel: data?.phone_label ?? "+503 7952-8033 / +503 7554-6785",
    phoneHref: data?.phone_href ?? "tel:+50379528033",
    email: data?.email ?? "",
    address: data?.address ?? "El Salvador",
    socialLinks,
    palette: {
      1: data?.palette_1 ?? "#235652",
      2: data?.palette_2 ?? "#183f3c",
      3: data?.palette_3 ?? "#373435",
      5: data?.palette_5 ?? "#686c6a",
      7: data?.palette_7 ?? "#f4f2be",
      8: data?.palette_8 ?? "#fbfaec",
    },
    footerRegistro: data?.footer_registro ?? null,
    footerCopyright: data?.footer_copyright ?? "© 2026 Club de Lobos.",
    footerCreditLabel: data?.footer_credit_label ?? "",
    footerCreditHref: data?.footer_credit_href ?? null,
  };
}

/** The one nav entry that represents this clone's own homepage. */
const HOME_HREF = "/";

export async function getNavLinks(currentPath = HOME_HREF): Promise<NavLink[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("nav_links")
    .select("id, label, href, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  return (data ?? []).map((l) => ({ id: l.id, label: l.label, href: l.href, active: l.href === currentPath }));
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("id, image_url, heading, description, button_label, href")
    .order("sort_order");

  return (data ?? []).map((s) => ({
    id: s.id,
    image: s.image_url,
    heading: s.heading,
    description: s.description,
    buttonLabel: s.button_label,
    href: s.href,
  }));
}

export async function getTours(): Promise<ProductCard[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tours")
    .select("id, slug, title, price, currency_symbol, departure_dates, images, button_label")
    .order("sort_order");

  return (data ?? []).map((t) => {
    const next = nextDepartureDate(t.departure_dates);
    return {
      id: t.id,
      title: t.title,
      price: t.price,
      currencySymbol: t.currency_symbol,
      nextDeparture: next ? formatDate(next) : "Fechas por confirmar",
      image: t.images[0]?.url ?? "",
      hoverImage: t.images[1]?.url ?? t.images[0]?.url ?? "",
      href: `/salidas/${encodeURIComponent(t.slug)}`,
      buttonLabel: t.button_label,
    };
  });
}

export interface CalendarTourData {
  id: string;
  slug: string;
  title: string;
  departureDate: string;
  imageUrl: string;
  price: string;
  currencySymbol: string;
}

/** One entry per (tour, departure date) pair — a tour with 3 configured
 * dates shows up on all 3 days on the calendar. */
export async function getCalendarTours(): Promise<CalendarTourData[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tours")
    .select("id, slug, title, departure_dates, images, price, currency_symbol, sort_order")
    .eq("is_published", true)
    .order("sort_order");

  return (data ?? []).flatMap((tour) => tour.departure_dates.map((date) => ({
    id: `${tour.id}-${date}`,
    slug: tour.slug,
    title: tour.title,
    departureDate: date,
    imageUrl: tour.images[0]?.url ?? "",
    price: tour.price,
    currencySymbol: tour.currency_symbol,
  }))).sort((a, b) => a.departureDate.localeCompare(b.departureDate));
}

export interface TourDetailData {
  id: string;
  slug: string;
  title: string;
  price: string;
  currencySymbol: string;
  departureDates: string[];
  images: { url: string; width: number; height: number }[];
}

export async function getTourBySlug(slug: string): Promise<TourDetailData | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tours")
    .select("id, slug, title, price, currency_symbol, departure_dates, images")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    price: data.price,
    currencySymbol: data.currency_symbol,
    departureDates: data.departure_dates,
    images: data.images,
  };
}

export async function getPublishedTourSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tours")
    .select("slug")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map((tour) => tour.slug);
}

export interface GuiasBlock {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  images: { src: string; width: number; height: number }[];
}

export interface CampingBlock {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  image: { src: string; width: number; height: number } | null;
}

export interface FotografiasBlock {
  heading: string;
  body: string;
  /** Portada gallery presentation: justified grid (default) or an
   *  auto-scrolling marquee strip. */
  layout: "grid" | "marquee";
}

function normalizeFotografias(raw: unknown): FotografiasBlock {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    heading: typeof value.heading === "string" ? value.heading : "",
    body: typeof value.body === "string" ? value.body : "",
    layout: value.layout === "marquee" ? "marquee" : "grid",
  };
}

export async function getContentBlocks(): Promise<{
  guias: GuiasBlock;
  camping: CampingBlock;
  fotografias: FotografiasBlock;
}> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("content_blocks").select("key, data");

  const byKey = Object.fromEntries((data ?? []).map((b) => [b.key, b.data]));

  return {
    guias: (byKey.guias as unknown as GuiasBlock) ?? { heading: "", buttonLabel: "", buttonHref: SALIDAS_URL, images: [] },
    camping: (byKey.camping as unknown as CampingBlock) ?? {
      heading: "",
      body: "",
      buttonLabel: "",
      buttonHref: SALIDAS_URL,
      image: null,
    },
    fotografias: normalizeFotografias(byKey.fotografias),
  };
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("id, image_url, image_w, image_h, title")
    .order("sort_order");

  return (data ?? []).map((g) => ({
    id: g.id,
    thumb: g.image_url,
    full: g.image_url,
    title: g.title,
    width: g.image_w,
    height: g.image_h,
  }));
}

export interface ReviewsData {
  reviews: Review[];
  summary: { rating: string; countLabel: string; stars: number };
}

export async function getReviews(): Promise<ReviewsData> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, author, review_date, rating, body_text")
    .order("sort_order");

  const reviews: Review[] = (data ?? []).map((r) => ({
    id: r.id,
    author: r.author,
    relativeDate: relativeYearsAgo(r.review_date),
    isoDate: r.review_date,
    rating: r.rating,
    text: r.body_text,
  }));

  // The rating summary ("EXCELENTE", "A base de 2976 reseñas") has no admin
  // screen yet in this phase — see scripts/seed-supabase.ts — so it stays a
  // fixed constant here rather than a half-wired DB read.
  return { reviews, summary: { rating: "LA MANADA", countLabel: "Aventuras que dejan huella", stars: 5 } };
}

function relativeYearsAgo(isoDate: string): string {
  const years = Math.max(0, new Date().getFullYear() - new Date(isoDate).getFullYear());
  if (years === 0) return "hace unos meses";
  return years === 1 ? "hace 1 año" : `hace ${years} años`;
}
