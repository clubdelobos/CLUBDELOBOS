import { requireRole } from "@/lib/auth/dal";
import { formatPrice, tourMoney } from "@/lib/currency";
import { getStoredTourDetailRecord, resolveTourDetailCopies } from "@/lib/queries/tour-details";
import { createClient } from "@/lib/supabase/server";
import { ToursManager } from "./ToursManager";

export default async function ToursPage() {
  // `select("*")` so the admin list still loads before 0010 (category/
  // subcategory) is applied — the editor then just shows the defaults.
  const toursPromise = createClient().then((supabase) => supabase
    .from("tours")
    .select("*")
    .order("sort_order"));
  const [, { data }, storedDetails] = await Promise.all([
    requireRole(["admin"]),
    toursPromise,
    getStoredTourDetailRecord(),
  ]);
  const tours = data ?? [];
  const details = resolveTourDetailCopies(tours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    price: formatPrice(tour.price),
  })), storedDetails);

  return (
    <ToursManager
      tours={tours.map((tour) => ({
        ...tour,
        // The editor takes numbers only; older free-text prices ("Consultar", "60 P/P") reopen as their number, or empty.
        price: tourMoney(tour.price).price.match(/\d[\d.,]*/)?.[0].replace(/,/g, "") ?? "",
        currency_symbol: tourMoney(tour.price).currencySymbol,
        category: tour.category ?? "nacional",
        subcategory: tour.subcategory ?? null,
        details: details[tour.id],
      }))}
    />
  );
}
