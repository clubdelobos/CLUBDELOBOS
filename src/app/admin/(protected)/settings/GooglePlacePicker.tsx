"use client";

import { useState, useTransition } from "react";
import { Check, Search } from "lucide-react";
import type { PlaceCandidate } from "@/lib/google-reviews";
import { findGooglePlaces } from "./actions";

const inputCls = "admin-input h-10 px-3";

/**
 * Finds the business's Google Maps listing by name and lets the admin pick the
 * right one — no hunting for the Place ID by hand. The pick only fills the
 * form field; "Guardar ajustes" is what publishes it.
 */
export function GooglePlacePicker({ value, onChange }: { value: string; onChange: (placeId: string) => void }) {
  const [query, setQuery] = useState("Club de Lobos Tours El Salvador");
  const [results, setResults] = useState<PlaceCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function search() {
    setError(null);
    startTransition(async () => {
      const result = await findGooglePlaces(query);
      if (result.error) {
        setResults(null);
        setError(result.error);
      } else {
        setResults(result.places ?? []);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--gn-palette-3)]">Buscar mi negocio en Google Maps</span>
        <div className="flex gap-2">
          <input
            className={`${inputCls} min-w-0 flex-1`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Nombre del negocio"
          />
          <button
            type="button"
            onClick={search}
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-xs font-bold text-[var(--gn-palette-3)] transition-colors hover:bg-[var(--gn-palette-8)] disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {pending ? "Buscando…" : "Buscar"}
          </button>
        </div>
        <span className="text-[11px] leading-4 text-[var(--gn-palette-5)]">
          Elige la ficha de “Agencia de viajes” con 5,0 y 14 reseñas. Requiere la variable GOOGLE_PLACES_API_KEY en Vercel.
        </span>
      </div>

      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}

      {results && results.length === 0 ? (
        <p className="text-xs text-[var(--gn-palette-5)]">Google no encontró resultados. Prueba con otro texto, por ejemplo el nombre y la ciudad.</p>
      ) : null}

      {results && results.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {results.map((place) => {
            const selected = place.id === value;
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onChange(place.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${selected ? "border-[var(--gn-palette-1)] bg-[var(--gn-palette-8)]" : "border-[#e5e8e5] bg-white hover:border-[#bdc7c0]"}`}
                >
                  <span className="min-w-0">
                    <strong className="block text-sm text-[var(--gn-palette-3)]">{place.name}</strong>
                    {place.address ? <span className="block text-[11px] leading-4 text-[var(--gn-palette-5)]">{place.address}</span> : null}
                    <span className="mt-1 block text-[11px] font-semibold text-[var(--gn-palette-3)]">
                      {place.rating !== null ? `${place.rating.toFixed(1).replace(".", ",")} ★` : "Sin calificación"}
                      {place.ratingCount !== null ? ` · ${place.ratingCount} reseñas` : ""}
                    </span>
                  </span>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-[var(--gn-palette-1)] text-white" : "bg-[#f2f4f2] text-[#68716b]"}`}>
                    {selected ? <><Check className="h-3 w-3" />Elegida</> : "Elegir"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--gn-palette-3)]">Place ID elegido</span>
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Sin configurar" spellCheck={false} />
        <span className="text-[11px] leading-4 text-[var(--gn-palette-5)]">
          Se llena solo al elegir un resultado. Si ya lo tienes (empieza con “ChIJ…”), puedes pegarlo aquí.
        </span>
      </label>
    </div>
  );
}
