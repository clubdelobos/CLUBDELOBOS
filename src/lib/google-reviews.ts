import "server-only";
import type { Review } from "@/types/guianatours-com-co-e923d4eb";

/**
 * Real Google Maps reviews via the Places API (New).
 *
 * - Needs `GOOGLE_PLACES_API_KEY` (server-only env var) and the business's
 *   Place ID (Ajustes → Reseñas de Google). Without either, returns null and
 *   the site falls back to the reviews the admin entered by hand.
 * - Google returns at most 5 reviews (most relevant), but the overall rating
 *   and total count are complete.
 * - Not persisted: Google's terms restrict storing review content, so the
 *   response only lives in Next's fetch cache (`revalidate` = 24 h, matching
 *   the pages' own ISR window). A new review shows up within a day.
 * - Google can't be written to from a website; "Deja tu comentario" links to
 *   Google's own review page instead (see `writeReviewUrl`).
 */

const REVALIDATE_SECONDS = 86400;

export interface GoogleReviewsResult {
  reviews: Review[];
  rating: number | null;
  totalCount: number | null;
  mapsUrl: string | null;
}

interface PlacesReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
  publishTime?: string;
}

interface PlacesResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
}

export function writeReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

/**
 * Opens the business listing (all reviews) in Google Maps: the official Maps
 * URL format, which opens the Maps app on phones that have it and the browser
 * otherwise. `query` is required alongside `query_place_id` (the old
 * `/maps/place/?q=place_id:` form shows "no results" on mobile).
 */
export function mapsPlaceUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Club de Lobos Tours")}&query_place_id=${encodeURIComponent(placeId)}`;
}

/** Pure mapping, exported so it can be checked without hitting the network. */
export function mapPlacesResponse(data: PlacesResponse): GoogleReviewsResult {
  const reviews: Review[] = (data.reviews ?? []).flatMap((r, index) => {
    const text = (r.text?.text ?? r.originalText?.text ?? "").trim();
    // A star-only rating has nothing to show in a testimonial card.
    if (!text) return [];
    const rating = Math.min(5, Math.max(1, Math.round(r.rating ?? 5)));
    return [
      {
        id: r.name ?? `google-${index}`,
        author: r.authorAttribution?.displayName?.trim() || "Cliente de Google",
        relativeDate: r.relativePublishTimeDescription ?? "",
        isoDate: r.publishTime?.slice(0, 10) ?? "",
        rating,
        text,
      },
    ];
  });

  return {
    reviews,
    rating: typeof data.rating === "number" ? data.rating : null,
    totalCount: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
    mapsUrl: data.googleMapsUri ?? null,
  };
}

export async function fetchGoogleReviews(placeId: string): Promise<GoogleReviewsResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey || !placeId) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es`,
      {
        headers: {
          // Key in a header, not the URL, so it can't end up in logs/caches keys.
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) {
      console.error("Google Places request failed:", response.status);
      return null;
    }
    return mapPlacesResponse((await response.json()) as PlacesResponse);
  } catch (error) {
    console.error("Google Places request errored:", error instanceof Error ? error.message : error);
    return null;
  }
}
