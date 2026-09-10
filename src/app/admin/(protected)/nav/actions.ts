"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { linkTargetSchema } from "@/lib/validation";

const NavLinkSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, { message: "El nombre del enlace no puede quedar vacío." }).max(40),
  href: linkTargetSchema,
  isActive: z.boolean(),
});

export interface ActionState {
  error?: string;
  success?: boolean;
}

function revalidateNav() {
  // The menu renders in the shared layout of every public page.
  revalidatePath("/", "layout");
  revalidatePath("/admin/nav");
}

export async function upsertNavLink(raw: z.infer<typeof NavLinkSchema>): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = NavLinkSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  const supabase = await createClient();
  const row = { label: d.label, href: d.href, is_active: d.isActive };
  const { error } = d.id
    ? await supabase.from("nav_links").update(row).eq("id", d.id)
    : await supabase.from("nav_links").insert({ ...row, sort_order: 9999 });

  if (error) return { error: error.message };
  revalidateNav();
  return { success: true };
}

export async function deleteNavLink(id: string): Promise<ActionState> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("nav_links").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateNav();
  return { success: true };
}

const OrderedIdsSchema = z.array(z.string().uuid()).min(1).max(100);

export async function reorderNavLinks(orderedIds: string[]): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = OrderedIdsSchema.safeParse(orderedIds);
  if (!parsed.success) return { error: "Orden no válido." };
  const supabase = await createClient();
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("nav_links").update({ sort_order: i }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  revalidateNav();
  return { success: true };
}
