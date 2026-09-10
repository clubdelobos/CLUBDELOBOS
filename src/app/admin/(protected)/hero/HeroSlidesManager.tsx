"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Modal } from "@/components/admin/Modal";
import { deleteHeroSlide, reorderHeroSlides, upsertHeroSlide } from "./actions";

export interface HeroSlideRow {
  id: string; image_url: string; image_w: number; image_h: number; heading: string; description: string; button_label: string; href: string; is_published: boolean;
}

const inputCls = "admin-input h-10 px-3";
const EMPTY: Omit<HeroSlideRow, "id"> = { image_url: "", image_w: 0, image_h: 0, heading: "", description: "", button_label: "Ver aventuras", href: "/proximas-salidas", is_published: true };

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}><span className="text-xs font-bold text-[var(--gn-palette-3)]">{label}</span>{children}</label>;
}

function SlideEditor({ slide, onDeleted, onSaved }: { slide: HeroSlideRow | null; onDeleted?: () => void; onSaved?: (row: HeroSlideRow) => void }) {
  const [form, setForm] = useState(slide ?? EMPTY);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    if (!form.image_url || !form.image_w) { setMessage("Agrega una imagen para la diapositiva."); return; }
    if (!form.heading.trim()) { setMessage("El título no puede quedar vacío."); return; }
    if (!form.description.trim()) { setMessage("La descripción no puede quedar vacía."); return; }
    if (!form.button_label.trim()) { setMessage("El texto del botón no puede quedar vacío."); return; }
    if (!form.href.trim()) { setMessage("Agrega el enlace del botón."); return; }
    setMessage(null);
    startTransition(async () => {
      const result = await upsertHeroSlide({ id: slide?.id, imageUrl: form.image_url, imageW: form.image_w, imageH: form.image_h, heading: form.heading, description: form.description, buttonLabel: form.button_label, href: form.href, isPublished: form.is_published });
      if (result.error) setMessage(result.error);
      else if (!slide) window.location.reload();
      else { setMessage("Cambios publicados."); onSaved?.({ ...form, id: slide.id }); }
    });
  }

  function confirmRemove() {
    if (!slide) return;
    startTransition(async () => {
      const result = await deleteHeroSlide(slide.id);
      if (result.error) { setMessage(result.error); setConfirmDelete(false); }
      else onDeleted?.();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar diapositiva"
        message="¿Eliminar esta diapositiva de la portada? Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        pending={pending}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDelete(false)}
      />
      <ImageUploader bucket="media" label="Imagen" value={form.image_w ? { url: form.image_url, width: form.image_w, height: form.image_h } : null} onChange={(image) => setForm((current) => ({ ...current, image_url: image.url, image_w: image.width, image_h: image.height }))} previewClassName="aspect-[16/9] w-full rounded-xl object-cover" />
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field label="Título" className="sm:col-span-2"><input className={inputCls} value={form.heading} onChange={(e) => setForm((current) => ({ ...current, heading: e.target.value }))} /></Field>
        <Field label="Descripción" className="sm:col-span-2"><textarea className="admin-input min-h-20 resize-y px-3 py-2" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></Field>
        <Field label="Texto del botón"><input className={inputCls} value={form.button_label} onChange={(e) => setForm((current) => ({ ...current, button_label: e.target.value }))} /></Field>
        <Field label="Enlace"><input className={inputCls} value={form.href} onChange={(e) => setForm((current) => ({ ...current, href: e.target.value }))} /></Field>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gn-palette-3)] sm:col-span-2"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm((current) => ({ ...current, is_published: e.target.checked }))} />Visible en el sitio</label>
      </div>
      {message ? <p className={`text-xs font-semibold ${message.includes("publicados") ? "text-emerald-700" : "text-red-600"}`}>{message}</p> : null}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-4">
        {slide ? <button type="button" onClick={() => setConfirmDelete(true)} disabled={pending} className="admin-danger-btn px-3 py-2 text-xs"><Trash2 className="h-4 w-4" />Eliminar</button> : <span />}
        <button type="button" onClick={save} disabled={pending} className="gn-button disabled:opacity-50"><span className="inline-flex items-center">{pending ? "Guardando…" : slide ? "Guardar" : "Agregar diapositiva"}</span></button>
      </div>
    </div>
  );
}

function SlideCard({ slide, index, total, onEdit, onMove }: {
  slide: HeroSlideRow; index: number; total: number; onEdit: () => void; onMove: (delta: number) => void;
}) {
  return (
    <div className="admin-card overflow-hidden">
      <button type="button" onClick={onEdit} className="flex w-full flex-col text-left">
        <span className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--gn-palette-8)]">
          <Image src={slide.image_url} alt="" width={slide.image_w} height={slide.image_h} className="h-full w-full object-cover" />
          {!slide.is_published ? <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Oculta</span> : null}
        </span>
        <span className="flex flex-col gap-1 p-3">
          <strong className="truncate text-sm text-[var(--gn-palette-3)]">{slide.heading || "Sin título"}</strong>
          <span className="truncate text-xs text-[var(--gn-palette-5)]">{slide.description || "Sin descripción"}</span>
        </span>
      </button>
      <div className="flex items-center justify-between border-t border-black/5 px-3 py-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Subir" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-5)] hover:bg-[var(--gn-palette-8)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Bajar" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-5)] hover:bg-[var(--gn-palette-8)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
        </div>
        <button type="button" onClick={onEdit} className="text-xs font-bold text-[var(--gn-palette-1)]">Editar</button>
      </div>
    </div>
  );
}

export function HeroSlidesManager({ slides: initial }: { slides: HeroSlideRow[] }) {
  const [slides, setSlides] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function move(index: number, delta: number) {
    const next = [...slides]; const target = index + delta; if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; setSlides(next);
    startTransition(() => { void reorderHeroSlides(next.map((slide) => slide.id)); });
  }

  const editingSlide = slides.find((slide) => slide.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Portada</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gn-palette-5)]">
            Diapositivas del inicio. Toca una tarjeta para editarla; usa las flechas para cambiar su orden.
          </p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="gn-button inline-flex shrink-0 font-bold">
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Nueva diapositiva</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            total={slides.length}
            onEdit={() => setEditingId(slide.id)}
            onMove={(delta) => move(index, delta)}
          />
        ))}
      </div>

      {creating ? (
        <Modal title="Nueva diapositiva" onClose={() => setCreating(false)} maxWidthClassName="max-w-xl">
          <SlideEditor slide={null} />
        </Modal>
      ) : null}

      {editingSlide ? (
        <Modal title="Editar diapositiva" onClose={() => setEditingId(null)} maxWidthClassName="max-w-xl">
          <SlideEditor
            slide={editingSlide}
            onDeleted={() => { setSlides((current) => current.filter((item) => item.id !== editingSlide.id)); setEditingId(null); }}
            onSaved={(row) => setSlides((current) => current.map((item) => (item.id === row.id ? row : item)))}
          />
        </Modal>
      ) : null}
    </div>
  );
}
