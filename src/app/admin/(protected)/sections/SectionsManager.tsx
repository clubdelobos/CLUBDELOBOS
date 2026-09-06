"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { updateContentBlock } from "./actions";
import type { CampingBlock, FotografiasBlock, GuiasBlock } from "@/lib/queries/site-content";

const inputCls = "admin-input h-10 px-3";

function SaveBar({ pending, message, onSave }: { pending: boolean; message: string | null; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onSave} disabled={pending} className="gn-button disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
      {message ? <span className="text-sm text-green-700">{message}</span> : null}
    </div>
  );
}

function GuiasEditor({ initial }: { initial: GuiasBlock }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    startTransition(async () => {
      const result = await updateContentBlock("guias", form as unknown as Record<string, unknown>);
      setMessage(result.error ?? "Guardado.");
    });
  }

  return (
    <section className="admin-card flex flex-col gap-4 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--gn-palette-3)]">Aventuras y destinos</h2>
      <input
        className={inputCls}
        placeholder="Título"
        value={form.heading}
        onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
      />
      <input
        className={inputCls}
        placeholder="Texto del botón"
        value={form.buttonLabel}
        onChange={(e) => setForm((f) => ({ ...f, buttonLabel: e.target.value }))}
      />
      <input
        className={inputCls}
        placeholder="Enlace del botón"
        value={form.buttonHref}
        onChange={(e) => setForm((f) => ({ ...f, buttonHref: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <ImageUploader
            key={i}
            bucket="media"
            label={`Foto ${i + 1}`}
            value={form.images[i] ? { url: form.images[i].src, width: form.images[i].width, height: form.images[i].height } : null}
            onChange={(img) =>
              setForm((f) => {
                const images = [...f.images];
                images[i] = { src: img.url, width: img.width, height: img.height };
                return { ...f, images };
              })
            }
            previewClassName="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ))}
      </div>
      <SaveBar pending={pending} message={message} onSave={save} />
    </section>
  );
}

function CampingEditor({ initial }: { initial: CampingBlock }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    startTransition(async () => {
      const result = await updateContentBlock("camping", form as unknown as Record<string, unknown>);
      setMessage(result.error ?? "Guardado.");
    });
  }

  return (
    <section className="admin-card flex flex-col gap-4 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--gn-palette-3)]">Nuestra comunidad</h2>
      <input
        className={inputCls}
        placeholder="Título"
        value={form.heading}
        onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
      />
      <textarea
        className={inputCls + " h-24"}
        placeholder="Texto"
        value={form.body}
        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
      />
      <input
        className={inputCls}
        placeholder="Texto del botón"
        value={form.buttonLabel}
        onChange={(e) => setForm((f) => ({ ...f, buttonLabel: e.target.value }))}
      />
      <input
        className={inputCls}
        placeholder="Enlace del botón"
        value={form.buttonHref}
        onChange={(e) => setForm((f) => ({ ...f, buttonHref: e.target.value }))}
      />
      <ImageUploader
        bucket="media"
        label="Foto"
        value={form.image ? { url: form.image.src, width: form.image.width, height: form.image.height } : null}
        onChange={(img) => setForm((f) => ({ ...f, image: { src: img.url, width: img.width, height: img.height } }))}
        previewClassName="aspect-[16/8] w-full rounded-lg object-cover"
      />
      <SaveBar pending={pending} message={message} onSave={save} />
    </section>
  );
}

function FotografiasEditor({ initial }: { initial: FotografiasBlock }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    startTransition(async () => {
      const result = await updateContentBlock("fotografias", form as unknown as Record<string, unknown>);
      setMessage(result.error ?? "Guardado.");
    });
  }

  return (
    <section className="admin-card flex flex-col gap-4 p-5 sm:p-6 lg:col-span-2">
      <h2 className="text-lg font-bold text-[var(--gn-palette-3)]">Galería de aventuras</h2>
      <input
        className={inputCls}
        placeholder="Título"
        value={form.heading}
        onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
      />
      <textarea
        className={inputCls + " h-24"}
        placeholder="Texto"
        value={form.body}
        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[var(--gn-palette-3)]">Presentación en la portada</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            { id: "grid", title: "Cuadrícula", desc: "Mosaico justificado, todas las fotos visibles." },
            { id: "marquee", title: "Marquesina", desc: "Carrusel infinito que se desplaza solo. Ideal en móvil." },
          ] as const).map((option) => {
            const selected = (form.layout ?? "grid") === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setForm((f) => ({ ...f, layout: option.id }))}
                className={`rounded-xl border p-3 text-left transition-colors ${selected ? "border-[var(--gn-palette-1)] bg-[var(--gn-palette-8)] ring-2 ring-[var(--gn-palette-1)]/10" : "border-[#e5e8e5] bg-white hover:border-[#bdc7c0]"}`}
              >
                <strong className="block text-sm text-[var(--gn-palette-3)]">{option.title}</strong>
                <span className="mt-0.5 block text-[11px] leading-4 text-[var(--gn-palette-5)]">{option.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[var(--gn-palette-5)]">Las fotos de la galería se administran en &quot;Galería&quot;.</p>
      <SaveBar pending={pending} message={message} onSave={save} />
    </section>
  );
}

export function SectionsManager({
  guias,
  camping,
  fotografias,
}: {
  guias: GuiasBlock;
  camping: CampingBlock;
  fotografias: FotografiasBlock;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GuiasEditor initial={guias} />
      <CampingEditor initial={camping} />
      <FotografiasEditor initial={fotografias} />
    </div>
  );
}
