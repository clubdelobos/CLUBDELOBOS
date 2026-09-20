"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { searchPlaces, type PlaceCandidate } from "@/lib/google-reviews";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { optionalAssetUrlSchema, optionalHttpUrlSchema } from "@/lib/validation";

const HEX = /^#[0-9a-fA-F]{6}$/;

const SettingsSchema = z.object({
  logoHeaderUrl: optionalAssetUrlSchema,
  logoFooterUrl: optionalAssetUrlSchema,
  faviconUrl: optionalAssetUrlSchema,
  phoneLabel: z.string().min(1),
  phoneHref: z.string().min(1),
  email: z.union([z.literal(""), z.string().email()]),
  bookingNotifyEmail: z.union([z.literal(""), z.string().email()]),
  googlePlaceId: z.string().trim().max(200).regex(/^[A-Za-z0-9_-]*$/, { message: "El Place ID solo lleva letras, números, guiones y guion bajo." }),
  address: z.string().nullable(),
  socialFacebookUrl: optionalHttpUrlSchema.nullable(),
  socialInstagramUrl: optionalHttpUrlSchema.nullable(),
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
  revalidatePath("/legal/[slug]", "page");
  revalidatePath("/admin", "layout");
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
    booking_notify_email: d.bookingNotifyEmail,
    google_place_id: d.googlePlaceId,
    address: d.address,
    social_facebook_url: d.socialFacebookUrl || null,
    social_instagram_url: d.socialInstagramUrl || null,
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

const BankAccountsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      bank: z.string().trim().min(1, { message: "Cada cuenta necesita el nombre del banco." }).max(100),
      accountType: z.string().trim().max(60),
      accountNumber: z.string().trim().min(1, { message: "Cada cuenta necesita su número." }).max(60),
      holder: z.string().trim().max(120),
    }),
  )
  .max(10, { message: "Máximo 10 cuentas." });

/**
 * Replaces the bank-account list shown in the WhatsApp message. Runs on the
 * admin's own session (not the service role) so RLS — admin-only writes on
 * `payment_accounts` — is the enforcement, not just this check. Upsert first,
 * then delete what's no longer listed, so a failure midway never loses data.
 */
export async function saveBankAccounts(raw: z.input<typeof BankAccountsSchema>): Promise<SettingsState> {
  await requireRole(["admin"]);
  const parsed = BankAccountsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Cuentas inválidas." };
  const accounts = parsed.data;
  const supabase = await createClient();

  if (accounts.length > 0) {
    const { error } = await supabase.from("payment_accounts").upsert(
      accounts.map((a, index) => ({
        id: a.id,
        bank: a.bank,
        account_type: a.accountType,
        account_number: a.accountNumber,
        holder: a.holder,
        sort_order: index,
      })),
    );
    if (error) return { error: error.message };
  }

  const remove = supabase.from("payment_accounts").delete();
  const { error: deleteError } = accounts.length > 0
    ? await remove.not("id", "in", `(${accounts.map((a) => a.id).join(",")})`)
    : await remove.not("id", "is", null);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/bookings");
  return { success: true };
}

/** Admin-only lookup that powers the "Buscar mi negocio" picker in Ajustes. */
export async function findGooglePlaces(query: string): Promise<{ places?: PlaceCandidate[]; error?: string }> {
  await requireRole(["admin"]);
  const q = typeof query === "string" ? query.trim() : "";
  if (q.length < 3 || q.length > 120) return { error: "Escribe al menos 3 letras del nombre del negocio." };
  const result = await searchPlaces(q);
  return "error" in result ? { error: result.error } : { places: result.places };
}
