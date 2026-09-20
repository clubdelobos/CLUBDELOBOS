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

export interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  ratingCount: number | null;
}

interface SearchTextResponse {
  places?: {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
  }[];
}

/**
 * Text Search (New) — lets the admin find their Google Maps listing by name and
 * pick it, instead of hunting for the Place ID by hand. Admin-only, on demand,
 * never cached and never used on public requests.
 */
export async function searchPlaces(query: string): Promise<{ places: PlaceCandidate[] } | { error: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return { error: "Falta la variable GOOGLE_PLACES_API_KEY en Vercel (y un redeploy después de crearla)." };
  }
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery: query, languageCode: "es", regionCode: "SV", pageSize: 6 }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Google Places search failed:", response.status);
      return {
        error:
          response.status === 403 || response.status === 400
            ? "Google rechazó la key. Revisa que “Places API (New)” esté habilitada, que la facturación esté activa y que la key no esté restringida a otra API."
            : `Google respondió con un error (${response.status}). Inténtalo de nuevo.`,
      };
    }
    const data = (await response.json()) as SearchTextResponse;
    const places = (data.places ?? []).flatMap((p) =>
      p.id
        ? [
            {
              id: p.id,
              name: p.displayName?.text ?? "Sin nombre",
              address: p.formattedAddress ?? "",
              rating: typeof p.rating === "number" ? p.rating : null,
              ratingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
            },
          ]
        : [],
    );
    return { places };
  } catch (error) {
    console.error("Google Places search errored:", error instanceof Error ? error.message : error);
    return { error: "No se pudo contactar a Google. Inténtalo de nuevo." };
  }
}
