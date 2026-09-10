"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { deleteNavLink, reorderNavLinks, upsertNavLink } from "./actions";

export interface NavLinkRow {
  id: string;
  label: string;
  href: string;
  is_active: boolean;
  sort_order: number;
}

const inputCls = "admin-input h-10 px-3";
const EMPTY: Omit<NavLinkRow, "id" | "sort_order"> = { label: "", href: "/", is_active: true };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--gn-palette-3)]">{label}</span>
      {children}
      {hint ? <span className="text-[11px] leading-4 text-[var(--gn-palette-5)]">{hint}</span> : null}
    </label>
  );
}

function LinkEditor({ link, onDeleted }: { link: NavLinkRow | null; onDeleted?: () => void }) {
  const [form, setForm] = useState<Omit<NavLinkRow, "id" | "sort_order">>(
    link ? { label: link.label, href: link.href, is_active: link.is_active } : EMPTY,
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    if (!form.label.trim()) { setMessage("El nombre del enlace no puede quedar vacío."); return; }
    if (!form.href.trim()) { setMessage("Escribe a dónde lleva el enlace."); return; }
    setMessage(null);
    startTransition(async () => {
      const result = await upsertNavLink({
        id: link?.id,
        label: form.label,
        href: form.href,
        isActive: form.is_active,
      });
      if (result.error) setMessage(result.error);
      else window.location.reload();
    });
  }

  function remove() {
    if (!link || !window.confirm(`¿Eliminar el enlace "${link.label}"?`)) return;
    startTransition(async () => {
      const result = await deleteNavLink(link.id);
      if (result.error) setMessage(result.error);
      else { onDeleted?.(); window.location.reload(); }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Nombre visible">
        <input className={inputCls} value={form.label} onChange={(e) => setForm((c) => ({ ...c, label: e.target.value }))} placeholder="Inicio" />
      </Field>
      <Field label="Enlace" hint="Una ruta del sitio (/proximas-salidas), un ancla (#nosotros) o una URL completa.">
        <input className={inputCls} value={form.href} onChange={(e) => setForm((c) => ({ ...c, href: e.target.value }))} placeholder="/proximas-salidas" />
      </Field>
      <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gn-palette-3)]">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((c) => ({ ...c, is_active: e.target.checked }))} />
        Visible en el menú
      </label>
      {message ? <p className="text-xs font-semibold text-red-600">{message}</p> : null}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-4">
        {link ? (
          <button type="button" onClick={remove} disabled={pending} className="admin-danger-btn px-3 py-2 text-xs">
            <Trash2 className="h-4 w-4" />Eliminar
          </button>
        ) : <span />}
        <button type="button" onClick={save} disabled={pending} className="gn-button disabled:opacity-50">
          <span className="inline-flex items-center">{pending ? "Guardando…" : link ? "Guardar" : "Agregar enlace"}</span>
        </button>
      </div>
    </div>
  );
}

export function NavLinksManager({ links: initial }: { links: NavLinkRow[] }) {
  const [links, setLinks] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function move(index: number, delta: number) {
    const next = [...links];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLinks(next);
    startTransition(() => { void reorderNavLinks(next.map((l) => l.id)); });
  }

  const editing = links.find((l) => l.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button type="button" onClick={() => setCreating(true)} className="gn-button inline-flex shrink-0 font-bold">
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Nuevo enlace</span>
        </button>
      </div>

      {links.length === 0 ? (
        <p className="admin-card p-6 text-center text-sm text-[var(--gn-palette-5)]">
          El menú está vacío. Agrega el primer enlace (por ejemplo, <strong>Inicio</strong> → <code>/</code>).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((link, index) => (
            <li key={link.id} className="admin-card flex items-center gap-3 px-3 py-2.5">
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--gn-palette-5)]" />
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-5)] hover:bg-[var(--gn-palette-8)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === links.length - 1} aria-label="Bajar" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-5)] hover:bg-[var(--gn-palette-8)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-[var(--gn-palette-3)]">{link.label || "Sin nombre"}</strong>
                <span className="block truncate text-xs text-[var(--gn-palette-5)]">{link.href}</span>
              </div>
              {!link.is_active ? <span className="shrink-0 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Oculto</span> : null}
              <button type="button" onClick={() => setEditingId(link.id)} className="shrink-0 text-xs font-bold text-[var(--gn-palette-1)]">Editar</button>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <Modal title="Nuevo enlace" onClose={() => setCreating(false)} maxWidthClassName="max-w-md">
          <LinkEditor link={null} />
        </Modal>
      ) : null}

      {editing ? (
        <Modal title="Editar enlace" onClose={() => setEditingId(null)} maxWidthClassName="max-w-md">
          <LinkEditor link={editing} onDeleted={() => setEditingId(null)} />
        </Modal>
      ) : null}
    </div>
  );
}
