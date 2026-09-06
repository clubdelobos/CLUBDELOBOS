"use client";

import { useState, useTransition } from "react";
import { BrandPackageUploader } from "@/components/admin/BrandPackageUploader";
import type { SiteSettingsData } from "@/lib/queries/site-content";
import { findSitePaletteId, SITE_PALETTES, type SitePaletteId } from "@/lib/site-palettes";
import { updateSiteSettings } from "./actions";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5"><span className="text-xs font-bold text-[var(--gn-palette-3)]">{label}</span>{children}{hint ? <span className="text-[11px] leading-4 text-[var(--gn-palette-5)]">{hint}</span> : null}</label>;
}

const inputCls = "admin-input h-10 px-3";

interface FormState {
  logoHeader: string | null; logoFooter: string | null; favicon: string | null;
  phoneLabel: string; phoneHref: string; email: string; address: string;
  facebook: string; instagram: string; youtube: string; tiktok: string;
  palette1: string; palette2: string; palette3: string; palette5: string; palette7: string; palette8: string;
  registro: string; copyright: string; creditLabel: string; creditHref: string;
}

function toFormState(settings: SiteSettingsData): FormState {
  const social = (network: string) => settings.socialLinks.find((link) => link.network === network)?.href ?? "";
  return {
    logoHeader: settings.logoHeaderUrl, logoFooter: settings.logoFooterUrl, favicon: settings.faviconUrl,
    phoneLabel: settings.phoneLabel, phoneHref: settings.phoneHref, email: settings.email, address: settings.address ?? "",
    facebook: social("facebook"), instagram: social("instagram"), youtube: social("youtube"), tiktok: social("tiktok"),
    palette1: settings.palette[1], palette2: settings.palette[2], palette3: settings.palette[3], palette5: settings.palette[5], palette7: settings.palette[7], palette8: settings.palette[8],
    registro: settings.footerRegistro ?? "", copyright: settings.footerCopyright, creditLabel: settings.footerCreditLabel, creditHref: settings.footerCreditHref ?? "",
  };
}

function Section({ title, description, children, className = "" }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section className={`admin-card p-5 sm:p-6 ${className}`}><h2 className="text-base font-extrabold text-[var(--gn-palette-3)]">{title}</h2>{description ? <p className="mt-1 text-xs leading-5 text-[var(--gn-palette-5)]">{description}</p> : null}<div className="mt-5">{children}</div></section>;
}

function previewPalette(colors: Record<1 | 2 | 3 | 5 | 7 | 8, string>) {
  const shell = document.getElementById("admin-shell");
  if (!shell) return;
  for (const key of [1, 2, 3, 5, 7, 8] as const) {
    shell.style.setProperty(`--gn-palette-${key}`, colors[key]);
  }
}

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [state, setState] = useState<FormState>(() => toFormState(initial));
  const [pending, startTransition] = useTransition();
  const [palettePending, setPalettePending] = useState<SitePaletteId | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  function set<K extends keyof FormState>(key: K, value: FormState[K]) { setState((current) => ({ ...current, [key]: value })); }

  const activePalette = findSitePaletteId({
    1: state.palette1,
    2: state.palette2,
    3: state.palette3,
    5: state.palette5,
    7: state.palette7,
    8: state.palette8,
  });

  async function selectPalette(id: SitePaletteId) {
    if (activePalette === id || palettePending) return;

    const colors = SITE_PALETTES[id].colors;
    const previous = {
      palette1: state.palette1,
      palette2: state.palette2,
      palette3: state.palette3,
      palette5: state.palette5,
      palette7: state.palette7,
      palette8: state.palette8,
    };
    setState((current) => ({
      ...current,
      palette1: colors[1],
      palette2: colors[2],
      palette3: colors[3],
      palette5: colors[5],
      palette7: colors[7],
      palette8: colors[8],
    }));
    previewPalette(colors);
    setMessage(null);
    setPalettePending(id);

    try {
      const response = await fetch("/api/admin/site-palette", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => null) as { error?: string; success?: boolean } | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo aplicar la paleta.");
      }
      setMessage({ type: "success", text: `Paleta “${SITE_PALETTES[id].name}” aplicada a todo el sitio.` });
    } catch (error) {
      setState((current) => ({ ...current, ...previous }));
      previewPalette({
        1: previous.palette1,
        2: previous.palette2,
        3: previous.palette3,
        5: previous.palette5,
        7: previous.palette7,
        8: previous.palette8,
      });
      setMessage({ type: "error", text: error instanceof Error ? error.message : "No se pudo aplicar la paleta." });
    } finally {
      setPalettePending(null);
    }
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSiteSettings({
        logoHeaderUrl: state.logoHeader, logoFooterUrl: state.logoFooter, faviconUrl: state.favicon,
        phoneLabel: state.phoneLabel, phoneHref: state.phoneHref, email: state.email, address: state.address || null,
        socialFacebookUrl: state.facebook || null, socialInstagramUrl: state.instagram || null, socialYoutubeUrl: state.youtube || null, socialTiktokUrl: state.tiktok || null,
        palette1: state.palette1, palette2: state.palette2, palette3: state.palette3, palette5: state.palette5, palette7: state.palette7, palette8: state.palette8,
        footerRegistro: state.registro || null, footerCopyright: state.copyright, footerCreditLabel: state.creditLabel, footerCreditHref: state.creditHref || null,
      });
      setMessage(result.error ? { type: "error", text: result.error } : { type: "success", text: "Ajustes publicados correctamente." });
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Paquete de marca" description="Un solo PNG actualiza todos los tamaños necesarios." className="lg:col-span-2">
        <BrandPackageUploader currentLogo={state.logoHeader} primary={state.palette1} accent={state.palette7} onApplied={(values) => setState((current) => ({ ...current, logoHeader: values.logoHeaderUrl, logoFooter: values.logoFooterUrl, favicon: values.faviconUrl }))} />
      </Section>

      <Section title="Contacto" description="Datos públicos mostrados en el encabezado y pie de página.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfonos visibles"><input className={inputCls} value={state.phoneLabel} onChange={(e) => set("phoneLabel", e.target.value)} /></Field>
          <Field label="Enlace al llamar" hint="Ejemplo: tel:+50379528033"><input className={inputCls} value={state.phoneHref} onChange={(e) => set("phoneHref", e.target.value)} /></Field>
          <Field label="Correo (opcional)"><input type="email" className={inputCls} value={state.email} onChange={(e) => set("email", e.target.value)} placeholder="No publicado" /></Field>
          <Field label="Ubicación (opcional)"><input className={inputCls} value={state.address} onChange={(e) => set("address", e.target.value)} placeholder="El Salvador" /></Field>
        </div>
      </Section>

      <Section title="Redes sociales" description="Deja en blanco las redes que no estén verificadas.">
        <div className="grid gap-4">
          <Field label="Instagram"><input className={inputCls} value={state.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Facebook"><input className={inputCls} value={state.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="Sin verificar" /></Field><Field label="TikTok"><input className={inputCls} value={state.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="Sin verificar" /></Field></div>
          <Field label="YouTube"><input className={inputCls} value={state.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="Sin verificar" /></Field>
        </div>
      </Section>

      <Section title="Paleta visual" description="Selecciona una de las tres combinaciones. El cambio se publica inmediatamente en todo el sitio.">
        <div className="grid gap-3">
          {(Object.entries(SITE_PALETTES) as [SitePaletteId, (typeof SITE_PALETTES)[SitePaletteId]][]).map(([id, palette]) => {
            const selected = activePalette === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                disabled={pending || palettePending !== null}
                onClick={() => selectPalette(id)}
                className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${selected ? "border-[var(--gn-palette-1)] bg-[var(--gn-palette-8)] ring-2 ring-[var(--gn-palette-1)]/10" : "border-[#e5e8e5] bg-white hover:border-[#bdc7c0]"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <strong className="block text-sm text-[var(--gn-palette-3)]">{palette.name}</strong>
                    <span className="mt-1 block text-[11px] leading-4 text-[var(--gn-palette-5)]">{palette.description}</span>
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-[var(--gn-palette-1)] text-white" : "bg-[#f2f4f2] text-[#68716b]"}`}>
                    {palettePending === id ? "Aplicando…" : selected ? "Activa" : "Seleccionar"}
                  </span>
                </span>
                <span className="mt-3 flex overflow-hidden rounded-lg border border-black/5" aria-hidden="true">
                  {Object.values(palette.colors).map((color) => <span key={color} className="h-7 flex-1" style={{ backgroundColor: color }} />)}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Pie de página" description="Información institucional y derechos del sitio.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Línea institucional"><input className={inputCls} value={state.registro} onChange={(e) => set("registro", e.target.value)} /></Field>
          <Field label="Copyright"><input className={inputCls} value={state.copyright} onChange={(e) => set("copyright", e.target.value)} /></Field>
          <Field label="Crédito (opcional)"><input className={inputCls} value={state.creditLabel} onChange={(e) => set("creditLabel", e.target.value)} /></Field>
          <Field label="Enlace del crédito"><input className={inputCls} value={state.creditHref} onChange={(e) => set("creditHref", e.target.value)} /></Field>
        </div>
      </Section>

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-[#dfe4df] bg-white/95 p-3 shadow-xl backdrop-blur lg:col-span-2">
        <div aria-live="polite">{message ? <p className={`text-xs font-semibold ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p> : <p className="text-xs text-[var(--gn-palette-5)]">Guarda para publicar contacto, redes, colores y pie de página.</p>}</div>
        <button type="button" onClick={save} disabled={pending} className="gn-button shrink-0 disabled:opacity-50">{pending ? "Guardando…" : "Guardar ajustes"}</button>
      </div>
    </div>
  );
}
