"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveBankAccounts } from "./actions";

export interface BankAccountRow {
  id: string;
  bank: string;
  account_type: string;
  account_number: string;
  holder: string;
}

const inputCls = "admin-input h-10 px-3";

function newAccount(): BankAccountRow {
  return { id: crypto.randomUUID(), bank: "", account_type: "", account_number: "", holder: "" };
}

/**
 * The accounts pasted into the WhatsApp message when a customer chose
 * "Transferencia bancaria". Kept in its own table (not site_settings) so the
 * numbers are never readable by the public site — see migration 0012.
 */
export function BankAccountsManager({ initial }: { initial: BankAccountRow[] }) {
  const [accounts, setAccounts] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function update(id: string, patch: Partial<BankAccountRow>) {
    setAccounts((current) => current.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setMessage(null);
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveBankAccounts(
        accounts.map((a) => ({ id: a.id, bank: a.bank, accountType: a.account_type, accountNumber: a.account_number, holder: a.holder })),
      );
      setMessage(result.error ? { type: "error", text: result.error } : { type: "success", text: "Cuentas guardadas." });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {accounts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 px-4 py-6 text-center text-xs leading-5 text-[var(--gn-palette-5)]">
          Aún no hay cuentas. Agrégalas para que el mensaje de WhatsApp las incluya cuando el cliente elija transferencia.
        </p>
      ) : null}

      {accounts.map((account, index) => (
        <div key={account.id} className="rounded-xl border border-black/10 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gn-palette-3)]">Cuenta {index + 1}</span>
            <button
              type="button"
              onClick={() => setAccounts((current) => current.filter((a) => a.id !== account.id))}
              className="admin-danger-btn px-2.5 py-1.5 text-xs"
              aria-label={`Quitar la cuenta ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />Quitar
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            <input className={inputCls} placeholder="Banco (p. ej. Banco Agrícola)" value={account.bank} maxLength={100} onChange={(e) => update(account.id, { bank: e.target.value })} />
            <input className={inputCls} placeholder="Tipo (p. ej. Cuenta de ahorros)" value={account.account_type} maxLength={60} onChange={(e) => update(account.id, { account_type: e.target.value })} />
            <input className={inputCls} placeholder="Número de cuenta" inputMode="numeric" value={account.account_number} maxLength={60} onChange={(e) => update(account.id, { account_number: e.target.value })} />
            <input className={inputCls} placeholder="Titular" value={account.holder} maxLength={120} onChange={(e) => update(account.id, { holder: e.target.value })} />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setAccounts((current) => [...current, newAccount()])}
          disabled={accounts.length >= 10}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-2 text-xs font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />Agregar cuenta
        </button>
        <div className="flex items-center gap-3">
          <div aria-live="polite">
            {message ? <p className={`text-xs font-semibold ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p> : null}
          </div>
          <button type="button" onClick={save} disabled={pending} className="gn-button shrink-0 disabled:opacity-50">
            {pending ? "Guardando…" : "Guardar cuentas"}
          </button>
        </div>
      </div>
    </div>
  );
}
