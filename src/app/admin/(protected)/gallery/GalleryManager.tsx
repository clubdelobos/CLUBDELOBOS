"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { Modal } from "@/components/admin/Modal";
import { deleteGalleryItem, upsertGalleryItem } from "./actions";

export interface GalleryItemRow {
  id: string;
  image_url: string;
  image_w: number;
  image_h: number;
  title: string;
  is_published: boolean;
}

function ItemCard({ item, onChanged }: { item: GalleryItemRow; onChanged: (next: GalleryItemRow | null) => void }) {
  const [title, setTitle] = useState(item.title);
  const [published, setPublished] = useState(item.is_published);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dirty = title !== item.title || published !== item.is_published;

  function save() {
    const merged = { ...item, title, is_published: published };
    startTransition(async () => {
      const result = await upsertGalleryItem({
        id: merged.id,
        imageUrl: merged.image_url,
        imageW: merged.image_w,
        imageH: merged.image_h,
        title: merged.title,
        isPublished: merged.is_published,
      });
      if (result.error) setError(result.error);
      else onChanged(merged);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteGalleryItem(item.id);
      if (result.error) setError(result.error);
      else onChanged(null);
    });
  }

  return (
    <div className="admin-card overflow-hidden">
      <span className="relative block aspect-[4/5] w-full overflow-hidden bg-[var(--gn-palette-8)]">
        <Image src={item.image_url} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        {!published ? <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Oculta</span> : null}
      </span>
      <div className="flex flex-col gap-2 p-3">
        <input className="admin-input h-9 px-2 text-xs" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--gn-palette-3)]">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publicada
          </label>
          <div className="flex gap-1">
            <button type="button" onClick={save} disabled={pending || !dirty} aria-label="Guardar" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--gn-palette-1)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-30">
              <Check className="h-4 w-4" />
            </button>
            <button type="button" onClick={remove} disabled={pending} aria-label="Eliminar" className="admin-danger-btn h-7 w-7">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function AddPhotoModal({ onClose }: { onClose: () => void }) {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!image) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertGalleryItem({
        imageUrl: image.url,
        imageW: image.width,
        imageH: image.height,
        title: title.trim(),
        isPublished: published,
      });
      if (result.error) setError(result.error);
      else window.location.reload();
    });
  }

  return (
    <Modal title="Agregar foto a la galería" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <ImageUploader
          bucket="media"
          value={image}
          onChange={setImage}
          label="Imagen"
          previewClassName="aspect-[4/5] w-full max-w-[240px] rounded-xl object-cover"
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--gn-palette-3)]">Título (opcional)</span>
          <input className="admin-input h-10 px-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Atardeceres" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--gn-palette-3)]">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publicar de inmediato
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--gn-palette-5)] hover:bg-[var(--gn-palette-8)]">
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={!image || pending} className="gn-button disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? "Agregando…" : "Agregar a la galería"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function GalleryManager({ items: initial }: { items: GalleryItemRow[] }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gn-palette-3)] sm:text-3xl">Galería</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gn-palette-5)]">Fotografías de rutas y experiencias visibles en la portada.</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="gn-button inline-flex shrink-0 items-center gap-2 self-start"
        >
          <ImagePlus className="h-4 w-4" />
          Agregar foto
        </button>
      </div>

      {items.length === 0 ? (
        <div className="admin-card flex flex-col items-center gap-3 p-10 text-center">
          <ImagePlus className="h-8 w-8 text-[var(--gn-palette-5)]" />
          <p className="text-sm text-[var(--gn-palette-5)]">Aún no hay fotos en la galería.</p>
          <button type="button" onClick={() => setAdding(true)} className="gn-button">Agregar la primera foto</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onChanged={(next) => setItems((prev) => (next ? prev.map((i) => (i.id === item.id ? next : i)) : prev.filter((i) => i.id !== item.id)))}
            />
          ))}
        </div>
      )}

      {adding ? <AddPhotoModal onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
