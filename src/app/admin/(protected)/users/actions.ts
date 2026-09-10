"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/supabase/types";

const PASSWORD = z.string().min(12, { message: "Mínimo 12 caracteres." }).max(72, { message: "Máximo 72 caracteres." });

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: PASSWORD,
  fullName: z.string().min(1),
  role: z.enum(["admin", "worker"]),
});

const ResetPasswordSchema = z.object({
  userId: z.string().uuid(),
  password: PASSWORD,
});

export interface CreateUserState {
  error?: string;
  success?: string;
}

export interface ResetPasswordState {
  error?: string;
  success?: string;
}

/**
 * Admin-only. Uses the service-role client (bypasses RLS) via the Supabase
 * Admin API to create the auth user directly — this is the ONLY place a
 * role is ever assigned besides the DB trigger's 'worker' default, and it
 * only runs after `requireRole(["admin"])` passes.
 */
export async function createStaffAccount(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireRole(["admin"]);

  const parsed = CreateUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceRoleClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear la cuenta." };
  }

  // The DB trigger already inserted a 'worker' profile row for the new user;
  // only touch it here if the admin picked 'admin' instead.
  if (parsed.data.role === "admin") {
    const { error: roleErr } = await admin.from("profiles").update({ role: "admin" as ProfileRole }).eq(
      "id",
      data.user.id,
    );
    if (roleErr) return { error: `Cuenta creada, pero no se pudo asignar el rol: ${roleErr.message}` };
  }

  revalidatePath("/admin/users");
  return { success: `Cuenta creada para ${parsed.data.email}.` };
}

/**
 * Admin-only. Sets a new password for an existing staff account via the
 * Supabase Admin API (service role). The change takes effect immediately in
 * Supabase Auth; existing sessions for that user are not force-signed-out
 * here — the person just uses the new password next time.
 */
export async function resetStaffPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireRole(["admin"]);

  const parsed = ResetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message || "No se pudo cambiar la contraseña." };
  }

  revalidatePath("/admin/users");
  return { success: "Contraseña actualizada." };
}
