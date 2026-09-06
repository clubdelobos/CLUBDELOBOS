"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { optionalAssetUrlSchema, optionalHttpUrlSchema } from "@/lib/validation";

const HEX = /^#[0-9a-fA-F]{6}$/;

const SettingsSchema = z.object({
  logoHeaderUrl: optionalAssetUrlSchema,
  logoFooterUrl: optionalAssetUrlSchema,
  faviconUrl: optionalAssetUrlSchema,
  phoneLabel: z.string().min(1),
  phoneHref: z.string().min(1),
  email: z.union([z.literal(""), z.string().email()]),
  address: z.string().nullable(),
  socialFacebookUrl: optionalHttpUrlSchema.nullable(),
  socialInstagramUrl: optionalHttpUrlSchema.nullable(),
  socialYoutubeUrl: optionalHttpUrlSchema.nullable(),
  socialTiktokUrl: optionalHttpUrlSchema.nullable(),
  palette1: z.string().regex(HEX),
  palette2: z.string().regex(HEX),
  palette3: z.string().regex(HEX),
  palette5: z.string().regex(HEX),
  palette7: z.string().regex(HEX),
  palette8: z.string().regex(HEX),
  footerRegistro: z.string().nullable(),
  footerCopyright: z.string().min(1),
  footerCreditLabel: z.string(),
  footerCreditHref: optionalHttpUrlSchema.nullable(),
});

const BrandSchema = z.object({
  logoHeaderUrl: optionalAssetUrlSchema.unwrap(),
  logoFooterUrl: optionalAssetUrlSchema.unwrap(),
  faviconUrl: optionalAssetUrlSchema.unwrap(),
});

export interface SettingsState { error?: string; success?: boolean }

function revalidateSettings() {
  revalidatePath("/");
  revalidatePath("/club-de-lobos");
  revalidatePath("/calendario");
  revalidatePath("/proximas-salidas");
  revalidatePath("/salidas/[slug]", "page");
}

export async function applyBrandPackage(raw: z.infer<typeof BrandSchema>): Promise<SettingsState> {
  await requireRole(["admin"]);
  const parsed = BrandSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Paquete de marca inválido." };
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("site_settings").update({
    logo_header_url: parsed.data.logoHeaderUrl,
    logo_footer_url: parsed.data.logoFooterUrl,
    favicon_url: parsed.data.faviconUrl,
  }).eq("id", 1);
  if (error) return { error: error.message };
  revalidateSettings();
  return { success: true };
}

export async function updateSiteSettings(raw: z.infer<typeof SettingsSchema>): Promise<SettingsState> {
  await requireRole(["admin"]);
  const parsed = SettingsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("site_settings").update({
    logo_header_url: d.logoHeaderUrl,
    logo_footer_url: d.logoFooterUrl,
    favicon_url: d.faviconUrl,
    phone_label: d.phoneLabel,
    phone_href: d.phoneHref,
    email: d.email,
    address: d.address,
    social_facebook_url: d.socialFacebookUrl || null,
    social_instagram_url: d.socialInstagramUrl || null,
    social_youtube_url: d.socialYoutubeUrl || null,
    social_tiktok_url: d.socialTiktokUrl || null,
    palette_1: d.palette1,
    palette_2: d.palette2,
    palette_3: d.palette3,
    palette_5: d.palette5,
    palette_7: d.palette7,
    palette_8: d.palette8,
    footer_registro: d.footerRegistro,
    footer_copyright: d.footerCopyright,
    footer_credit_label: d.footerCreditLabel,
    footer_credit_href: d.footerCreditHref || null,
  }).eq("id", 1);
  if (error) return { error: error.message };
  revalidateSettings();
  return { success: true };
}
