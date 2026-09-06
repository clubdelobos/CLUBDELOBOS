"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createStaffAccount, type CreateUserState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="gn-button disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? "Creando…" : "Crear cuenta"}
    </button>
  );
}

export function CreateUserForm() {
  const [state, formAction] = useActionState<CreateUserState, FormData>(createStaffAccount, {});

  return (
    <form action={formAction} className="admin-card flex w-full max-w-md flex-col gap-3 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-sm font-medium text-[var(--gn-palette-3)]">
          Nombre completo
        </label>
        <input id="fullName" name="fullName" required className="admin-input h-10 px-3" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-[var(--gn-palette-3)]">
          Correo
        </label>
        <input id="email" name="email" type="email" required className="admin-input h-10 px-3" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[var(--gn-palette-3)]">
          Contraseña temporal
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={12}
          className="admin-input h-10 px-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-[var(--gn-palette-3)]">
          Rol
        </label>
        <select id="role" name="role" defaultValue="worker" className="admin-input h-10 px-3">
          <option value="worker">Trabajador (solo ve reservas)</option>
          <option value="admin">Administrador (acceso total)</option>
        </select>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">{state.success}</p> : null}
      <SubmitButton />
    </form>
  );
}
