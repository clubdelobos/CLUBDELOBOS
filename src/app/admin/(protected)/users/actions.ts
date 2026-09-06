"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/supabase/types";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, { message: "Mínimo 12 caracteres." }),
  fullName: z.string().min(1),
  role: z.enum(["admin", "worker"]),
});

export interface CreateUserState {
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
