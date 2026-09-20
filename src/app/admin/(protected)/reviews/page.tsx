import { requireRole } from "@/lib/auth/dal";
import { mapsPlaceUrl } from "@/lib/google-reviews";
import { createClient } from "@/lib/supabase/server";
import { ReviewsManager } from "./ReviewsManager";

export default async function ReviewsPage() {
  const dataPromise = createClient().then(async (supabase) => {
    const [reviews, settings] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, author, review_date, rating, body_text, is_published, created_at")
        .order("sort_order"),
      // `*` so this still works before 0012 adds google_place_id.
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    return { reviews, settings };
  });
  const [, { reviews, settings }] = await Promise.all([requireRole(["admin"]), dataPromise]);

  const rows = reviews.data ?? [];
  const placeId = settings.data?.google_place_id?.trim() ?? "";
  // The reviews are loaded by hand from Google Maps, so surface when the last
  // one was added to make the periodic "check Maps for new ones" easy to keep.
  const lastLoadedAt = rows.reduce<string | null>((latest, r) => (latest && latest > r.created_at ? latest : r.created_at), null);

  return (
    <ReviewsManager
      reviews={rows.map((r) => ({ id: r.id, author: r.author, review_date: r.review_date, rating: r.rating, body_text: r.body_text, is_published: r.is_published }))}
      mapsUrl={placeId ? mapsPlaceUrl(placeId) : null}
      lastLoadedAt={lastLoadedAt}
    />
  );
}
