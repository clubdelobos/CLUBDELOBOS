"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { CURRENCY_LABEL, formatPrice } from "@/lib/currency";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SUBCATEGORY_IDS, TOUR_CATEGORIES } from "@/lib/tour-categories";
import { TOUR_ICON_IDS, TOUR_INFO_SECTIONS, TOUR_ITINERARY_STEP_COUNT, type TourInfoSectionKey } from "@/lib/tour-details";
import { assetUrlSchema } from "@/lib/validation";

// Messages are fragments ("no puede estar vacío"); issueMessage() prefixes the
// field name so the admin sees exactly which box failed. A message ending in
// "." is already a full sentence and is shown as is.
const EMPTY = "no puede estar vacío";
const maxChars = (n: number) => `máximo ${n} caracteres`;

const TourFactSchema = z.object({
  key: z.string().min(1).max(40),
  label: z.string().max(40, maxChars(40)),
  value: z.string().max(100, maxChars(100)),
  icon: z.enum(TOUR_ICON_IDS),
  enabled: z.boolean().optional().default(true),
}).superRefine((fact, ctx) => {
  // Hidden cards never reach the public page, so they may stay blank.
  if (!fact.enabled) return;
  for (const field of ["label", "value"] as const) {
    if (!fact[field].trim()) ctx.addIssue({ code: "custom", path: [field], message: EMPTY });
  }
});

const ItineraryStepSchema = z.object({
  title: z.string().trim().min(1, "Completa el título de cada paso del itinerario.").max(80, "El título de un paso del itinerario admite máximo 80 caracteres."),
  body: z.string().trim().min(1, "Completa el texto de cada paso del itinerario.").max(500, "El texto de un paso del itinerario admite máximo 500 caracteres."),
});

function requiredSection(title: string) {
  return z.string().trim().min(1, `Completa la sección “${title}”.`).max(1000, `La sección “${title}” admite máximo 1000 caracteres.`);
}

const TourDetailSchema = z.object({
  lead: z.string().trim().min(1, EMPTY).max(600, maxChars(600)),
  // Blank descriptions are dropped instead of rejected.
  paragraphs: z.array(z.string().max(1200, maxChars(1200))).max(4)
    .transform((items) => items.map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1, "Escribe al menos una descripción.")),
  facts: z.array(TourFactSchema).min(1).max(24),
  itinerary: z.array(ItineraryStepSchema).length(TOUR_ITINERARY_STEP_COUNT, "El itinerario necesita los 3 pasos."),
  sections: z.object(
    Object.fromEntries(TOUR_INFO_SECTIONS.map(({ key, title }) => [key, requiredSection(title)])) as Record<TourInfoSectionKey, ReturnType<typeof requiredSection>>,
  ),
});

const TourImageSchema = z.object({
  url: assetUrlSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const TourSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1, EMPTY).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  title: z.string().trim().min(1, EMPTY).max(150, maxChars(150)),
  price: z.string().trim().regex(/^\d{1,7}(\.\d{1,2})?$/, "Precio: escribe solo números, por ejemplo 45 o 45.50."),
  departureDates: z.array(z.string().min(1)).min(1, "Agrega al menos una fecha.").max(10, "Máximo 10 fechas por salida."),
  images: z.array(TourImageSchema).min(1, "Agrega al menos una imagen.").max(5, "Máximo 5 imágenes por salida."),
  buttonLabel: z.string().trim().min(1, EMPTY).max(60, maxChars(60)),
  isPublished: z.boolean(),
  category: z.enum(TOUR_CATEGORIES),
  subcategory: z.enum(SUBCATEGORY_IDS).nullable(),
  details: TourDetailSchema,
}).refine(
  (value) => !(value.category === "nacional" && !value.subcategory),
  { path: ["subcategory"], message: "Elige una subcategoría para la salida nacional." },
);

const FIELD_LABELS: Record<string, string> = {
  title: "Nombre de la aventura",
  price: "Precio",
  buttonLabel: "Texto del botón",
  slug: "Identificador",
};

function issueMessage(issue: z.core.$ZodIssue): string {
  if (issue.message.endsWith(".")) return issue.message;
  const path = issue.path.map(String);
  let label = FIELD_LABELS[path[0]];
  if (path[0] === "details" && path[1] === "lead") label = "Introducción";
  if (path[0] === "details" && path[1] === "paragraphs") label = `Descripción ${Number(path[2]) + 1}`;
  if (path[0] === "details" && path[1] === "facts") {
    label = `Tarjeta ${Number(path[2]) + 1} (${path[3] === "value" ? "Valor" : "Nombre"})`;
  }
  return label ? `${label}: ${issue.message}` : "Hay un dato inválido en el formulario.";
}

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

export async function upsertTour(raw: z.input<typeof TourSchema>): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = TourSchema.safeParse(raw);
  if (!parsed.success) return { error: issueMessage(parsed.error.issues[0]) };
  const d = parsed.data;
  const price = d.price;
  // The currency is system-managed: the "Precio" card always mirrors price + $USD.
  d.details.facts = d.details.facts.map((fact) => fact.key === "price" ? { ...fact, value: formatPrice(price) } : fact);

  const supabase = createServiceRoleClient();
  const row = {
    slug: d.slug,
    title: d.title,
    price,
    currency_symbol: CURRENCY_LABEL,
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
