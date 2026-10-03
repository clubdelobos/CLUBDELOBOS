import { createPublicClient } from "@/lib/supabase/public";
import {
  getDefaultTourDetail,
  normalizeTourDetail,
  type TourDetailCopy,
} from "@/lib/tour-details";

export interface TourDetailSource {
  id: string;
  slug: string;
  duration?: string;
  price?: string;
}

export async function getStoredTourDetailRecord(): Promise<Record<string, unknown>> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("data")
    .eq("key", "guias")
    .single();

  const block = data?.data;
  if (!block || typeof block !== "object" || Array.isArray(block)) return {};
  const tourDetails = (block as Record<string, unknown>).tourDetails;
  return tourDetails && typeof tourDetails === "object" && !Array.isArray(tourDetails)
    ? tourDetails as Record<string, unknown>
    : {};
}

export async function getTourDetailCopy(source: TourDetailSource): Promise<TourDetailCopy> {
  const stored = await getStoredTourDetailRecord();
  return resolveTourDetailCopy(source, stored);
}

export async function getTourDetailCopies(sources: TourDetailSource[]): Promise<Record<string, TourDetailCopy>> {
  const stored = await getStoredTourDetailRecord();
  return resolveTourDetailCopies(sources, stored);
}

export function resolveTourDetailCopy(source: TourDetailSource, stored: Record<string, unknown>): TourDetailCopy {
  const fallback = getDefaultTourDetail(source.slug, source);
  const detail = normalizeTourDetail(stored[source.id], fallback);
  if (source.price === undefined) return detail;
  // The "Precio" card is system-managed: it always mirrors the tour's price + $USD.
  return { ...detail, facts: detail.facts.map((fact) => fact.key === "price" ? { ...fact, value: source.price! } : fact) };
}

export function resolveTourDetailCopies(sources: TourDetailSource[], stored: Record<string, unknown>): Record<string, TourDetailCopy> {
  return Object.fromEntries(sources.map((source) => {
    return [source.id, resolveTourDetailCopy(source, stored)];
  }));
}
