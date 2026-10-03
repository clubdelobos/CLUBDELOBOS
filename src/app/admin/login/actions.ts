"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clientIpFrom } from "@/lib/net/client-ip";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email({ message: "Correo inválido." }),
  password: z.string().min(1, { message: "Ingresa tu contraseña." }),
  next: z.string().optional(),
});

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();

  // Brute-force guard on top of Supabase Auth's own limits: 10 tries / 15 min per
  // address and 8 per account. Fixed windows, so nobody stays locked out. Fails
  // open if 0009 isn't deployed.
  const ip = clientIpFrom(await headers());
  for (const [key, limit] of [[`login-ip:${ip}`, 10], [`login-user:${parsed.data.email.toLowerCase()}`, 8]] as const) {
    const { data: allowed, error: rlError } = await supabase.rpc("rate_limit_hit", { p_key: key, p_limit: limit, p_window_seconds: 900 });
    if (!rlError && allowed === false) return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const next = parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
