"use client";

import { Fragment, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { resetStaffPassword, type ResetPasswordState } from "./actions";

export interface StaffRow {
  id: string;
  fullName: string | null;
  email: string;
  role: "admin" | "worker";
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="gn-button h-9 shrink-0 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

function PasswordPanel({ user, onClose }: { user: StaffRow; onClose: () => void }) {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(resetStaffPassword, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-gray-100 bg-[var(--admin-surface-sunken)] px-4 py-3">
      <input type="hidden" name="userId" value={user.id} />
      <p className="text-xs text-[var(--gn-palette-5)]">
        Nueva contraseña para <span className="font-semibold text-[var(--gn-palette-3)]">{user.email}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          className="admin-input h-9 min-w-[220px] flex-1 px-3 text-sm"
        />
        <SaveButton />
        <button
          type="button"
          onClick={onClose}
          className="h-9 shrink-0 rounded-lg px-2 text-xs font-semibold text-[var(--gn-palette-5)] transition-colors hover:text-[var(--gn-palette-3)]"
        >
          Cancelar
        </button>
      </div>
      {state.error ? <p className="text-xs font-semibold text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-xs font-semibold text-green-700">{state.success}</p> : null}
    </form>
  );
}

export function UsersTable({ rows }: { rows: StaffRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="admin-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-[var(--gn-palette-5)]">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3 text-right">Acceso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <Fragment key={user.id}>
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--gn-palette-3)]">{user.fullName || "—"}</td>
                <td className="px-4 py-3 text-[var(--gn-palette-5)]">{user.email || "—"}</td>
                <td className="px-4 py-3 text-[var(--gn-palette-5)]">
                  {user.role === "admin" ? "Administrador" : "Trabajador"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingId((current) => (current === user.id ? null : user.id))}
                    aria-expanded={editingId === user.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gn-palette-1)]/30 px-2.5 py-1.5 text-xs font-bold text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-1)] hover:text-white"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Cambiar contraseña
                  </button>
                </td>
              </tr>
              {editingId === user.id ? (
                <tr>
                  <td colSpan={4} className="p-0">
                    <PasswordPanel user={user} onClose={() => setEditingId(null)} />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
