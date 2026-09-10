/**
 * Categoría y subcategoría de una salida — fuente única compartida por el
 * panel admin (`ToursManager` / `tours/actions.ts`) y la UI pública
 * (`CategoryFilter` / `SubcategoryButton`).
 *
 * Refleja los CHECK de `supabase/migrations/0010_tour_categories.sql`:
 *   category    ∈ {'nacional', 'internacional'}
 *   subcategory ∈ {'rios', 'pueblos', 'volcanes'} | null
 * Solo las salidas nacionales llevan subcategoría; las internacionales son
 * una lista simple (subcategory = null).
 *
 * Los `id` coinciden con las claves del motor de animación vendido
 * (`categorias/tour-motion.js`, `palette`) para no tener que mapear.
 */

export const TOUR_CATEGORIES = ["nacional", "internacional"] as const;
export type TourCategory = (typeof TOUR_CATEGORIES)[number];

export const TOUR_CATEGORY_LABELS: Record<TourCategory, string> = {
  nacional: "Nacionales",
  internacional: "Internacionales",
};

/**
 * Orden pedido por el cliente: Ríos → Pueblos vivos → Volcanes.
 * `label` es el rótulo visible; `description` acompaña al botón animado.
 */
export const NATIONAL_SUBCATEGORIES = [
  { id: "rios", label: "Ríos", description: "Agua, naturaleza y aventura" },
  { id: "pueblos", label: "Pueblos vivos", description: "Color, cultura y tradición" },
  { id: "volcanes", label: "Volcanes", description: "Caminos hacia la cima" },
] as const;

export type TourSubcategory = (typeof NATIONAL_SUBCATEGORIES)[number]["id"];

export const SUBCATEGORY_IDS = NATIONAL_SUBCATEGORIES.map((s) => s.id) as [
  TourSubcategory,
  ...TourSubcategory[],
];

export const SUBCATEGORY_LABELS = Object.fromEntries(
  NATIONAL_SUBCATEGORIES.map((s) => [s.id, s.label]),
) as Record<TourSubcategory, string>;

export function isTourSubcategory(value: unknown): value is TourSubcategory {
  return typeof value === "string" && (SUBCATEGORY_IDS as string[]).includes(value);
}
