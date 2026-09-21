import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { SiteSettingsData } from "@/lib/queries/site-content";

function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Other names people (and Google) use for the brand — feeds the "Club de
 * Lobos El Salvador" / "Lobos SV" branded queries. */
const BRAND_ALTERNATE_NAMES = ["Club de Lobos El Salvador", "Lobos SV", "Club de Lobos SV"];

/** Organization + TravelAgency schema — the branded-search win: gives Google
 * a name, logo, service area and verified profiles (Instagram, the Google
 * Maps listing…) to attach to a "Club de Lobos" query. */
export function buildOrganizationJsonLd(settings: SiteSettingsData) {
  const sameAs = [...settings.socialLinks.map((link) => link.href), settings.googleMapsUrl]
    .filter((href): href is string => /^https?:\/\//.test(href ?? ""));
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: SITE_URL,
    logo: absoluteUrl(settings.logoHeaderUrl),
    image: absoluteUrl("/brand/lobos/og-image.png"),
    description: "Tour operadora salvadoreña que organiza senderismo, camping, viajes nacionales e internacionales y aventuras guiadas por El Salvador.",
    slogan: "Aventuras guiadas, seguras y en manada",
    knowsAbout: ["Senderismo en El Salvador", "Camping", "Volcanes de El Salvador", "Viajes guiados", "Turismo de aventura"],
    areaServed: { "@type": "Country", name: "El Salvador" },
    address: {
      "@type": "PostalAddress",
      addressCountry: "SV",
      ...(settings.address ? { streetAddress: settings.address } : {}),
    },
    ...(settings.email ? { email: settings.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings.phoneHref
      ? {
          telephone: settings.phoneLabel,
          contactPoint: [{
            "@type": "ContactPoint",
            telephone: settings.phoneLabel,
            contactType: "customer service",
            areaServed: "SV",
            availableLanguage: ["es"],
          }],
        }
      : {}),
  };
}

/** WebSite schema — this is what Google reads to choose the site name shown
 * above the result ("Club de Lobos" rather than the bare domain). */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: SITE_URL,
    inLanguage: "es-SV",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Ordered list of the departures on the listing page — lets Google connect
 * "Club de Lobos" to each named trip. */
export function buildItemListJsonLd(name: string, items: { name: string; url: string; image?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface TourEventInput {
  title: string;
  slug: string;
  /** Every configured departure date; each upcoming one becomes its own Event. */
  departureDates: string[];
  description: string;
  imageUrl?: string;
  price: string;
  /** International trips depart from El Salvador but don't take place there. */
  international?: boolean;
}

/** The upcoming dates, or the last one if all have passed (an ended Event is
 * still valid markup; it just isn't surfaced as upcoming). Capped so a tour
 * with many dates can't bloat the page. */
function eventDates(dates: string[]): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = dates.filter((date) => date >= today).slice(0, 6);
  if (upcoming.length) return upcoming;
  const last = dates[dates.length - 1];
  return last ? [last] : [today];
}

/** Free-text prices ("Consultar") don't map to a valid Offer — only emit
 * one when the admin's price field is actually a number. */
function parsePrice(price: string): number | null {
  const numeric = price.replace(/[^0-9.]/g, "");
  const value = Number(numeric);
  return numeric && Number.isFinite(value) && value > 0 ? value : null;
}

/** Event schema, one per upcoming departure — El Salvador tour operators rank
 * in Google's event/trip results with startDate + location + offers, not a
 * generic Product. */
export function buildTourEventJsonLd(tour: TourEventInput) {
  const url = `${SITE_URL}/salidas/${encodeURIComponent(tour.slug)}`;
  const price = parsePrice(tour.price);
  const image = [tour.imageUrl ?? absoluteUrl("/brand/lobos/og-image.png")];
  return eventDates(tour.departureDates).map((startDate) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: tour.title,
    startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description: tour.description,
    image,
    url,
    inLanguage: "es",
    location: {
      "@type": "Place",
      name: tour.international ? tour.title : "El Salvador",
      address: tour.international ? tour.title : { "@type": "PostalAddress", addressCountry: "SV" },
    },
    organizer: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  }));
}

/** `<` is escaped so a title/description containing "</script>" can never
 * break out of the tag when this is injected via dangerouslySetInnerHTML. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
