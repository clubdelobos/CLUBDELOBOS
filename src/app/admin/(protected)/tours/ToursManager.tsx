"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Activity, AlertTriangle, Camera, ChevronDown, ChevronUp, CircleDollarSign, Clock3, Compass,
  Gauge, Mountain, Plus, Route, TentTree, Thermometer, Trash2, TrendingUp, Trees,
  UsersRound, Waves, X,
} from "lucide-react";
import { AddImageTile } from "@/components/admin/AddImageTile";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Modal } from "@/components/admin/Modal";
import {
  getDefaultTourDetail,
  TOUR_ICON_OPTIONS,
  type TourDetailCopy,
  type TourIconId,
} from "@/lib/tour-details";
import { reorderTours, upsertTour } from "./actions";

export interface TourImage { url: string; width: number; height: number }

export interface TourRow {
  id: string;
  slug: string;
  title: string;
  price: string;
  currency_symbol: string;
  departure_dates: string[];
  images: TourImage[];
  button_label: string;
  is_published: boolean;
  details: TourDetailCopy;
}

const MAX_IMAGES = 5;
const MAX_DATES = 10;
const inputCls = "admin-input h-10 px-3";
const EMPTY: Omit<TourRow, "id"> = {
  slug: "", title: "", price: "Consultar", currency_symbol: "$", departure_dates: [],
  images: [], button_label: "Ver salida", is_published: true, details: getDefaultTourDetail(""),
};

function formatDeparture(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const ICONS: Record<TourIconId, typeof Activity> = {
  compass: Compass, activity: Activity, gauge: Gauge, clock: Clock3,
  mountain: Mountain, elevation: TrendingUp, temperature: Thermometer,
  trees: Trees, route: Route, people: UsersRound, price: CircleDollarSign,
  tent: TentTree, camera: Camera, waves: Waves,
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}><span className="text-xs font-bold text-[var(--gn-palette-3)]">{label}</span>{children}</label>;
}

function DeleteTourDialog({
  title,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, pending]);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-tour-title">
      <button type="button" aria-label="Cerrar confirmación" disabled={pending} onClick={onCancel} className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 id="delete-tour-title" className="text-lg font-extrabold text-[var(--gn-palette-3)]">Eliminar salida</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--gn-palette-5)]">
              ¿Quieres eliminar <strong className="text-[var(--gn-palette-3)]">{title}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={pending} className="h-10 rounded-lg border border-[#d9ded9] px-4 text-sm font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={onConfirm} disabled={pending} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50">{pending ? "Eliminando…" : "Sí, eliminar"}</button>
        </div>
      </div>
    </div>
  );
}

function TourEditor({ tour, onDeleted, onSaved }: { tour: TourRow | null; onDeleted?: () => void; onSaved?: (row: TourRow) => void }) {
  const [form, setForm] = useState(tour ?? EMPTY);
  const [pendingDate, setPendingDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function save() {
    const images = form.images.filter((image) => image.url);
    if (images.length === 0) { setMessage("Agrega al menos una imagen."); return; }
    if (form.departure_dates.length === 0) { setMessage("Agrega al menos una fecha de salida."); return; }
    setMessage(null);
    startTransition(async () => {
      const result = await upsertTour({
        id: tour?.id,
        slug: form.slug || slugify(form.title),
        title: form.title,
        price: form.price,
        currencySymbol: form.currency_symbol,
        departureDates: form.departure_dates,
        images,
        buttonLabel: form.button_label,
        isPublished: form.is_published,
        details: form.details,
      });
      if (result.error) setMessage(result.error);
      else if (!tour) window.location.reload();
      else {
        setMessage("Cambios publicados.");
        setForm((current) => ({ ...current, images }));
        onSaved?.({ ...form, images, id: tour.id });
      }
    });
  }

  function setImage(index: number, image: TourImage) {
    setForm((current) => {
      const images = [...current.images];
      images[index] = image;
      return { ...current, images };
    });
  }

  function addImage(image: TourImage) {
    setForm((current) => (current.images.length >= MAX_IMAGES ? current : { ...current, images: [...current.images, image] }));
  }

  function removeImage(index: number) {
    setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  }

  function addDate(date: string) {
    setForm((current) => {
      if (!date || current.departure_dates.includes(date) || current.departure_dates.length >= MAX_DATES) return current;
      return { ...current, departure_dates: [...current.departure_dates, date].sort() };
    });
  }

  function removeDate(date: string) {
    setForm((current) => ({ ...current, departure_dates: current.departure_dates.filter((d) => d !== date) }));
  }

  async function remove() {
    if (!tour || deletePending) return;
    setDeleteError(null);
    setDeletePending(true);
    try {
      const response = await fetch(`/api/admin/tours/${encodeURIComponent(tour.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const result = await response.json().catch(() => null) as { success?: boolean; error?: string } | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo eliminar la salida.");
      }
      onDeleted?.();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "No se pudo eliminar la salida.");
    } finally {
      setDeletePending(false);
    }
  }

  function updateFact(index: number, patch: Partial<TourDetailCopy["facts"][number]>) {
    setForm((current) => ({
      ...current,
      details: {
        ...current.details,
        facts: current.details.facts.map((fact, factIndex) => factIndex === index ? { ...fact, ...patch } : fact),
      },
    }));
  }

  function setAllFacts(enabled: boolean) {
    setForm((current) => ({
      ...current,
      details: {
        ...current.details,
        facts: current.details.facts.map((fact) => ({ ...fact, enabled })),
      },
    }));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-bold text-[var(--gn-palette-3)]">Fotos (máximo 5)</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {form.images.map((image, index) => (
            <div key={image.url} className="relative">
              <ImageUploader
                bucket="media"
                value={image}
                onChange={(next) => setImage(index, next)}
                previewClassName="aspect-square w-full rounded-lg object-cover"
              />
              <button type="button" onClick={() => removeImage(index)} aria-label="Quitar imagen" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {form.images.length < MAX_IMAGES ? (
            <AddImageTile bucket="media" onAdded={addImage} className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#cfd6d0] bg-[#f8f9f7] text-[11px] font-semibold text-[var(--gn-palette-5)] transition-colors hover:border-[var(--gn-palette-1)] hover:text-[var(--gn-palette-1)]" />
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field label="Nombre de la aventura" className="sm:col-span-2"><input className={inputCls} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></Field>
        <Field label="Identificador"><input className={inputCls} value={form.slug} placeholder={slugify(form.title) || "volcan-santa-ana"} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} /></Field>
        <div className="grid grid-cols-[72px_1fr] gap-2">
          <Field label="Moneda"><input className={inputCls} value={form.currency_symbol} onChange={(e) => setForm((current) => ({ ...current, currency_symbol: e.target.value }))} placeholder="$" /></Field>
          <Field label="Precio"><input className={inputCls} value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} /></Field>
        </div>
        <Field label="Texto del botón"><input className={inputCls} value={form.button_label} onChange={(e) => setForm((current) => ({ ...current, button_label: e.target.value }))} /></Field>
        <div className="flex items-end"><label className="flex h-10 items-center gap-2 text-xs font-semibold text-[var(--gn-palette-3)]"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm((current) => ({ ...current, is_published: e.target.checked }))} />Publicado</label></div>

        <Field label={`Fechas de salida (${form.departure_dates.length}/${MAX_DATES})`} className="sm:col-span-2">
          {form.departure_dates.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {form.departure_dates.map((date) => (
                <span key={date} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gn-palette-8)] py-1 pl-3 pr-1.5 text-xs font-semibold text-[var(--gn-palette-3)]">
                  {formatDeparture(date)}
                  <button type="button" onClick={() => removeDate(date)} aria-label={`Quitar ${formatDeparture(date)}`} className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--gn-palette-5)] hover:bg-black/10">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          {form.departure_dates.length < MAX_DATES ? (
            <div className="flex gap-2">
              <input type="date" className={inputCls} value={pendingDate} onChange={(e) => setPendingDate(e.target.value)} />
              <button
                type="button"
                onClick={() => { if (pendingDate) { addDate(pendingDate); setPendingDate(""); } }}
                disabled={!pendingDate}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d9ded9] px-3 text-xs font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />Agregar fecha
              </button>
            </div>
          ) : null}
        </Field>

        <details className="rounded-xl border border-[#e2e6e2] bg-[#fafbfa] sm:col-span-2">
          <summary className="cursor-pointer px-4 py-3 text-sm font-extrabold text-[var(--gn-palette-3)]">Información completa e íconos de la salida</summary>
          <div className="grid gap-4 border-t border-[#e2e6e2] p-4">
            <Field label="Introducción">
              <textarea className="admin-input min-h-24 px-3 py-2" value={form.details.lead} onChange={(e) => setForm((current) => ({ ...current, details: { ...current.details, lead: e.target.value } }))} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {form.details.paragraphs.map((paragraph, index) => (
                <Field key={index} label={`Descripción ${index + 1}`}>
                  <textarea className="admin-input min-h-28 px-3 py-2" value={paragraph} onChange={(e) => setForm((current) => ({ ...current, details: { ...current.details, paragraphs: current.details.paragraphs.map((item, paragraphIndex) => paragraphIndex === index ? e.target.value : item) } }))} />
                </Field>
              ))}
            </div>
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-[var(--gn-palette-3)]">Tarjetas informativas</p>
                <span className="text-[11px] text-[var(--gn-palette-5)]">
                  {form.details.facts.filter((fact) => fact.enabled).length} visibles en la salida
                </span>
              </div>
              <p className="mb-3 text-[11px] leading-4 text-[var(--gn-palette-5)]">
                Marca solo las tarjetas que quieres mostrar en la página. Las demás se guardan pero quedan ocultas.
              </p>
              <div className="mb-3 flex gap-3">
                <button type="button" onClick={() => setAllFacts(true)} className="text-[11px] font-bold text-[var(--gn-palette-1)] hover:underline">Mostrar todas</button>
                <button type="button" onClick={() => setAllFacts(false)} className="text-[11px] font-bold text-[var(--gn-palette-1)] hover:underline">Ocultar todas</button>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {form.details.facts.map((fact, index) => {
                  const Icon = ICONS[fact.icon] ?? Activity;
                  return (
                    <div
                      key={fact.key}
                      className={`grid grid-cols-[26px_36px_minmax(90px,.7fr)_minmax(0,1.3fr)] items-center gap-2 rounded-lg border p-2 transition-colors ${fact.enabled ? "border-[#e2e6e2] bg-white" : "border-[#e8e8e8] bg-[#f4f5f4] opacity-60"}`}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Mostrar ${fact.label}`}
                        checked={fact.enabled}
                        onChange={(e) => updateFact(index, { enabled: e.target.checked })}
                        className="h-4 w-4 accent-[var(--gn-palette-1)]"
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]"><Icon className="h-5 w-5" /></div>
                      <div className="grid gap-1">
                        <input aria-label={`Nombre de tarjeta ${index + 1}`} className="admin-input h-9 px-2 text-xs font-bold" value={fact.label} onChange={(e) => updateFact(index, { label: e.target.value })} />
                        <select aria-label={`Ícono de ${fact.label}`} className="admin-input h-9 px-2 text-xs" value={fact.icon} onChange={(e) => updateFact(index, { icon: e.target.value as TourIconId })}>
                          {TOUR_ICON_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                        </select>
                      </div>
                      <input aria-label={`Valor de ${fact.label}`} className="admin-input h-9 px-2 text-xs" value={fact.value} onChange={(e) => updateFact(index, { value: e.target.value })} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      </div>

      {message ? <p className={`text-xs font-semibold ${message.includes("publicados") ? "text-emerald-700" : "text-red-600"}`}>{message}</p> : null}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-4">
        {tour ? <button type="button" onClick={() => { setDeleteError(null); setDeleteOpen(true); }} disabled={pending || deletePending} className="admin-danger-btn px-3 py-2 text-xs"><Trash2 className="h-4 w-4" />Eliminar</button> : <span />}
        <button type="button" onClick={save} disabled={pending} className="gn-button disabled:opacity-50"><span className="inline-flex items-center">{pending ? "Guardando…" : tour ? "Guardar" : "Agregar salida"}</span></button>
      </div>
      {tour && deleteOpen ? (
        <DeleteTourDialog
          title={tour.title}
          pending={deletePending}
          error={deleteError}
          onCancel={() => { if (!deletePending) setDeleteOpen(false); }}
          onConfirm={remove}
        />
      ) : null}
    </div>
  );
}

function nearestDeparture(dates: string[]): string | null {
  if (dates.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  return dates.find((date) => date >= today) ?? dates[dates.length - 1];
}

function TourCard({ tour, index, total, onEdit, onMove }: {
  tour: TourRow; index: number; total: number; onEdit: () => void; onMove: (delta: number) => void;
}) {
  const next = nearestDeparture(tour.departure_dates);
  return (
    <div className="admin-card overflow-hidden">
      <button type="button" onClick={onEdit} className="flex w-full flex-col text-left">
        <span className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--gn-palette-8)]">
          {tour.images[0] ? <Image src={tour.images[0].url} alt="" width={tour.images[0].width} height={tour.images[0].height} className="h-full w-full object-cover" /> : null}
          {tour.images.length > 1 ? <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">+{tour.images.length - 1}</span> : null}
          {!tour.is_published ? <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Oculta</span> : null}
        </span>
        <span className="flex flex-col gap-1 p-3">
          <strong className="truncate text-sm text-[var(--gn-palette-3)]">{tour.title || "Sin título"}</strong>
          <span className="flex items-center justify-between gap-2 text-xs text-[var(--gn-palette-5)]">
            <span className="truncate">{next ? formatDeparture(next) : "Sin fecha"}{tour.departure_dates.length > 1 ? ` (+${tour.departure_dates.length - 1})` : ""}</span>
            <span className="shrink-0 font-bold text-[var(--gn-palette-1)]">{tour.currency_symbol} {tour.price}</span>
          </span>
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

export function ToursManager({ tours: initial }: { tours: TourRow[] }) {
  const [tours, setTours] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function move(index: number, delta: number) {
    const next = [...tours];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setTours(next);
    startTransition(() => { void reorderTours(next.map((tour) => tour.id)); });
  }

  const editingTour = tours.find((tour) => tour.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gn-palette-3)]">Aventuras y salidas</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gn-palette-5)]">
            Tarjetas visibles en la portada. Desmarca &quot;Publicado&quot; para ocultar una salida sin eliminarla.
          </p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="gn-button inline-flex shrink-0 font-bold">
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Nueva salida</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour, index) => (
          <TourCard
            key={tour.id}
            tour={tour}
            index={index}
            total={tours.length}
            onEdit={() => setEditingId(tour.id)}
            onMove={(delta) => move(index, delta)}
          />
        ))}
      </div>

      {creating ? (
        <Modal title="Crear una nueva salida" onClose={() => setCreating(false)} maxWidthClassName="max-w-2xl">
          <TourEditor tour={null} />
        </Modal>
      ) : null}

      {editingTour ? (
        <Modal title="Editar salida" onClose={() => setEditingId(null)} maxWidthClassName="max-w-2xl">
          <TourEditor
            tour={editingTour}
            onDeleted={() => { setTours((current) => current.filter((item) => item.id !== editingTour.id)); setEditingId(null); }}
            onSaved={(row) => setTours((current) => current.map((item) => (item.id === row.id ? row : item)))}
          />
        </Modal>
      ) : null}
    </div>
  );
}
