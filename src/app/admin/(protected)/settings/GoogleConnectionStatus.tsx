"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CircleDashed, Plug, XCircle } from "lucide-react";
import type { GoogleConnectionResult } from "@/lib/google-reviews";
import { testGoogleConnection } from "./actions";

/**
 * Passive state (is the key in Vercel?) plus an on-demand "Probar conexión".
 * Nothing here calls Google until the button is pressed, so a not-yet-configured
 * site never shows an error. Reviews arrive automatically once the listing's
 * owner creates the key; until then the manual ones are used.
 */
export function GoogleConnectionStatus({ keyConfigured, placeId }: { keyConfigured: boolean; placeId: string }) {
  const [result, setResult] = useState<GoogleConnectionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function test() {
    setResult(null);
    startTransition(async () => setResult(await testGoogleConnection()));
  }

  return (
    <div className="rounded-xl border border-black/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[var(--gn-palette-3)]">
          {keyConfigured ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <CircleDashed className="h-4 w-4 shrink-0 text-[var(--gn-palette-5)]" />}
          {keyConfigured ? "API key detectada en Vercel" : "Sin conectar: se usan las reseñas manuales"}
        </p>
        <button
          type="button"
          onClick={test}
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/15 px-3 py-2 text-xs font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
        >
          <Plug className="h-4 w-4" />
          {pending ? "Probando…" : "Probar conexión"}
        </button>
      </div>

      {result?.ok ? (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Conectado a <strong>{result.name}</strong>
            {result.rating !== null ? ` · ${result.rating.toFixed(1).replace(".", ",")} ★` : ""}
            {result.ratingCount !== null ? ` · ${result.ratingCount} reseñas` : ""}. El sitio ya muestra las {result.reviewCount} reseñas que entrega Google.
          </span>
        </p>
      ) : null}
      {result && !result.ok ? (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-600">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{result.message}</span>
        </p>
      ) : null}

      <p className="mt-3 text-[11px] leading-4 text-[var(--gn-palette-5)]">
        {placeId ? "" : "Guarda primero el Place ID. "}
        Cuando la conexión funciona, el sitio muestra las reseñas de Google (hasta 5) y las manuales quedan de respaldo.
      </p>
    </div>
  );
}
