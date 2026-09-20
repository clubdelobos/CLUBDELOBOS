"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Plus, Star, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { deleteReview, upsertReview } from "./actions";

export interface ReviewRow {
  id: string;
  author: string;
  review_date: string;
  rating: number;
  body_text: string;
  is_published: boolean;
}

const inputCls = "admin-input h-10 px-3";
const EMPTY: Omit<ReviewRow, "id"> = {
  author: "",
  review_date: new Date().toISOString().slice(0, 10),
  rating: 5,
  body_text: "",
  is_published: true,
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-[var(--gn-palette-7)]">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-3.5 w-3.5" fill={i < rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function ReviewEditor({
  review,
  onSaved,
  onDeleted,
}: {
  review: ReviewRow | null;
  onSaved: (row: ReviewRow) => void;
  onDeleted?: () => void;
}) {
  const [form, setForm] = useState(review ?? EMPTY);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await upsertReview({
        id: review?.id,
        author: form.author,
        reviewDate: form.review_date,
        rating: form.rating,
        bodyText: form.body_text,
        isPublished: form.is_published,
      });
      if (result.error) setMessage(result.error);
      else if (!review) window.location.reload();
      else onSaved({ ...form, id: review.id });
    });
  }

  function remove() {
    if (!review) return;
    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (result.error) setMessage(result.error);
      else onDeleted?.();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_90px]">
        <input
          className={inputCls}
          placeholder="Nombre del cliente"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
        />
        <input
          type="date"
          className={inputCls}
          value={form.review_date}
          onChange={(e) => setForm((f) => ({ ...f, review_date: e.target.value }))}
        />
        <select
          className={inputCls}
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
      </div>
      <textarea
        className="admin-input min-h-28 px-3 py-2"
        placeholder="Texto de la reseña"
        value={form.body_text}
        onChange={(e) => setForm((f) => ({ ...f, body_text: e.target.value }))}
      />
      <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gn-palette-3)]">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
        />
        Publicada
      </label>
      {message ? <p className="text-xs font-semibold text-red-600">{message}</p> : null}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-4">
        {review ? <button type="button" onClick={remove} disabled={pending} className="admin-danger-btn px-3 py-2 text-xs"><Trash2 className="h-4 w-4" />Eliminar</button> : <span />}
        <button type="button" onClick={save} disabled={pending} className="gn-button disabled:opacity-60">
          <span className="inline-flex items-center">{pending ? "Guardando…" : review ? "Guardar cambios" : "Agregar reseña"}</span>
        </button>
      </div>
    </div>
  );
}

function ReviewCard({ review, onEdit }: { review: ReviewRow; onEdit: () => void }) {
  return (
    <button type="button" onClick={onEdit} className="admin-card flex flex-col gap-2 p-4 text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <strong className="block truncate text-sm text-[var(--gn-palette-3)]">{review.author || "Sin nombre"}</strong>
          <span className="text-[11px] text-[var(--gn-palette-5)]">{review.review_date}</span>
        </div>
        {!review.is_published ? <span className="shrink-0 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Oculta</span> : null}
      </div>
      <Stars rating={review.rating} />
      <p className="line-clamp-3 text-xs leading-5 text-[var(--gn-palette-5)]">{review.body_text || "Sin texto."}</p>
    </button>
  );
}

const REVIEW_CHECK_DAYS = 15;

export function ReviewsManager({ reviews: initial, mapsUrl, lastLoadedAt }: { reviews: ReviewRow[]; mapsUrl: string | null; lastLoadedAt: string | null }) {
  const [reviews, setReviews] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Days since the newest review was loaded; computed once per mount (this is a
  // reminder, not a live clock).
  const [daysSinceLoad] = useState(() => (lastLoadedAt ? Math.floor((Date.now() - new Date(lastLoadedAt).getTime()) / 86_400_000) : null));
  const dueForCheck = mapsUrl !== null && (daysSinceLoad === null || daysSinceLoad >= REVIEW_CHECK_DAYS);

  const editingReview = reviews.find((review) => review.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Testimonios</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gn-palette-5)]">Publica únicamente testimonios reales y autorizados.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="gn-button inline-flex shrink-0 font-bold">
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Nueva reseña</span>
        </button>
      </div>

      {mapsUrl ? (
        <div className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${dueForCheck ? "border-amber-300 bg-amber-50" : "border-black/10 bg-white"}`}>
          <div className="min-w-0 text-xs leading-5 text-[var(--gn-palette-3)]">
            <strong className="block text-sm">{dueForCheck ? "Toca revisar si hay reseñas nuevas en Google" : "Reseñas al día"}</strong>
            {daysSinceLoad === null
              ? "Aún no hay reseñas cargadas."
              : `La última reseña se cargó hace ${daysSinceLoad} ${daysSinceLoad === 1 ? "día" : "días"}.`}{" "}
            Cópialas desde Google Maps con “Nueva reseña” (nombre, estrellas y texto); se revisa cada {REVIEW_CHECK_DAYS} días.
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)]">
            <ExternalLink className="h-4 w-4" />Abrir reseñas en Google Maps
          </a>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onEdit={() => setEditingId(review.id)} />
        ))}
      </div>

      {creating ? (
        <Modal title="Nueva reseña" onClose={() => setCreating(false)}>
          <ReviewEditor review={null} onSaved={() => {}} />
        </Modal>
      ) : null}

      {editingReview ? (
        <Modal title="Editar reseña" onClose={() => setEditingId(null)}>
          <ReviewEditor
            review={editingReview}
            onSaved={(row) => { setReviews((current) => current.map((item) => (item.id === row.id ? row : item))); setEditingId(null); }}
            onDeleted={() => { setReviews((current) => current.filter((item) => item.id !== editingReview.id)); setEditingId(null); }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
