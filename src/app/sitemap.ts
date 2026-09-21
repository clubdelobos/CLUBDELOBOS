import type { MetadataRoute } from "next";
import { getTours } from "@/lib/queries/site-content";
import { SITE_URL } from "@/lib/site-config";

// No `lastModified`: stamping every URL with "now" on each build tells Google
// everything changed every time, and it learns to ignore the field. Google
// finds changes by recrawling, so an absent date is better than a false one.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tours = await getTours();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/proximas-salidas`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/calendario`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/club-de-lobos`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${SITE_URL}${tour.href}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: tour.image ? [tour.image] : undefined,
  }));

  return [...staticRoutes, ...tourRoutes];
}
