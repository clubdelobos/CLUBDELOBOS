"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { assetUrlSchema, linkTargetSchema } from "@/lib/validation";

const SlideSchema = z.object({
  id: z.string().uuid().optional(),
  imageUrl: assetUrlSchema,
  imageW: z.number().int().positive({ message: "Agrega una imagen para la diapositiva." }),
  imageH: z.number().int().positive({ message: "Agrega una imagen para la diapositiva." }),
  heading: z.string().trim().min(1, { message: "El título no puede quedar vacío." }),
  description: z.string().trim().min(1, { message: "La descripción no puede quedar vacía." }),
  buttonLabel: z.string().trim().min(1, { message: "El texto del botón no puede quedar vacío." }),
  href: linkTargetSchema,
  isPublished: z.boolean(),
});

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function upsertHeroSlide(raw: z.infer<typeof SlideSchema>): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = SlideSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  const supabase = await createClient();
  const row = {
    image_url: d.imageUrl,
    image_w: d.imageW,
    image_h: d.imageH,
    heading: d.heading,
    description: d.description,
    button_label: d.buttonLabel,
    href: d.href,
    is_published: d.isPublished,
  };

  const { error } = d.id
    ? await supabase.from("hero_slides").update(row).eq("id", d.id)
    : await supabase.from("hero_slides").insert({ ...row, sort_order: 9999 });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionState> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

const OrderedIdsSchema = z.array(z.string().uuid()).min(1).max(200);

/** One Server Action wrapping every row's new position — not N sequential calls. */
export async function reorderHeroSlides(orderedIds: string[]): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = OrderedIdsSchema.safeParse(orderedIds);
  if (!parsed.success) return { error: "Orden no válido." };
  const supabase = await createClient();
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("hero_slides").update({ sort_order: i }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}
