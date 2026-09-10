"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SUBCATEGORY_IDS, TOUR_CATEGORIES } from "@/lib/tour-categories";
import { TOUR_ICON_IDS } from "@/lib/tour-details";
import { assetUrlSchema } from "@/lib/validation";

const TourFactSchema = z.object({
  key: z.string().min(1).max(40),
  label: z.string().min(1).max(40),
  value: z.string().min(1).max(100),
  icon: z.enum(TOUR_ICON_IDS),
  enabled: z.boolean().optional().default(true),
});

const TourDetailSchema = z.object({
  lead: z.string().min(1).max(600),
  paragraphs: z.array(z.string().min(1).max(1200)).min(1).max(4),
  facts: z.array(TourFactSchema).min(1).max(24),
});

const TourImageSchema = z.object({
  url: assetUrlSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const TourSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  title: z.string().min(1),
  price: z.string().min(1),
  currencySymbol: z.string().max(4),
  departureDates: z.array(z.string().min(1)).min(1, "Agrega al menos una fecha.").max(10, "Máximo 10 fechas por salida."),
  images: z.array(TourImageSchema).min(1, "Agrega al menos una imagen.").max(5, "Máximo 5 imágenes por salida."),
  buttonLabel: z.string().min(1),
  isPublished: z.boolean(),
  category: z.enum(TOUR_CATEGORIES),
  subcategory: z.enum(SUBCATEGORY_IDS).nullable(),
  details: TourDetailSchema,
}).refine(
  (value) => !(value.category === "nacional" && !value.subcategory),
  { path: ["subcategory"], message: "Elige una subcategoría para la salida nacional." },
);

export interface ActionState {
  error?: string;
  success?: boolean;
}

function revalidateTours() {
  revalidatePath("/");
  revalidatePath("/club-de-lobos");
  revalidatePath("/calendario");
  revalidatePath("/proximas-salidas");
  revalidatePath("/salidas/[slug]", "page");
  revalidatePath("/admin/tours");
}

async function writeTourDetails(tourId: string, details: z.infer<typeof TourDetailSchema>) {
  const supabase = createServiceRoleClient();
  const { data: block, error: readError } = await supabase
    .from("content_blocks")
    .select("data")
    .eq("key", "guias")
    .single();
  if (readError) return readError;

  const blockData = block.data && typeof block.data === "object" && !Array.isArray(block.data)
    ? block.data as Record<string, unknown>
    : {};
  const existing = blockData.tourDetails && typeof blockData.tourDetails === "object" && !Array.isArray(blockData.tourDetails)
    ? blockData.tourDetails as Record<string, unknown>
    : {};
  const { error } = await supabase.from("content_blocks").update({
    data: { ...blockData, tourDetails: { ...existing, [tourId]: details } },
  }).eq("key", "guias");
  return error;
}

export async function upsertTour(raw: z.infer<typeof TourSchema>): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = TourSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  const supabase = createServiceRoleClient();
  const row = {
    slug: d.slug,
    title: d.title,
    price: d.price,
    currency_symbol: d.currencySymbol,
    departure_dates: [...d.departureDates].sort(),
    images: d.images,
    button_label: d.buttonLabel,
    is_published: d.isPublished,
    category: d.category,
    subcategory: d.category === "nacional" ? d.subcategory : null,
  };

  let tourId = d.id;
  if (tourId) {
    const { error } = await supabase.from("tours").update(row).eq("id", tourId);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("tours")
      .insert({ ...row, sort_order: 9999 })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "No se pudo crear la salida." };
    tourId = data.id;
  }

  const detailsError = await writeTourDetails(tourId, d.details);
  if (detailsError) return { error: `La salida se guardó, pero no su ficha: ${detailsError.message}` };
  revalidateTours();
  return { success: true };
}

const OrderedIdsSchema = z.array(z.string().uuid()).min(1).max(200);

export async function reorderTours(orderedIds: string[]): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = OrderedIdsSchema.safeParse(orderedIds);
  if (!parsed.success) return { error: "Orden no válido." };
  const supabase = createServiceRoleClient();
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("tours").update({ sort_order: i }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  revalidateTours();
  return { success: true };
}
