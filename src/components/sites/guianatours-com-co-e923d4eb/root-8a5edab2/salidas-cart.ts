"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny client-only "lista de salidas guardadas" — the header cart icon.
 * There is no checkout: the list is a shortlist the visitor builds while
 * browsing and then sends to the team in one WhatsApp message.
 *
 * State lives in localStorage and is shared across every component (and tab)
 * through a storage event + a same-tab custom event, read via
 * useSyncExternalStore so there's no hydration mismatch and no setState-in-effect.
 */
export interface SavedSalida {
  slug: string;
  title: string;
  price?: string;
}

const KEY = "lobos:salidas-guardadas";
const EVENT = "lobos:salidas-guardadas-change";
const EMPTY: SavedSalida[] = [];

function safeParse(raw: string): SavedSalida[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return value.filter(
      (item): item is SavedSalida =>
        item && typeof item.slug === "string" && typeof item.title === "string",
    );
  } catch {
    return EMPTY;
  }
}

let cache: { raw: string; parsed: SavedSalida[] } | null = null;

function getSnapshot(): SavedSalida[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY) ?? "[]";
  if (!cache || cache.raw !== raw) cache = { raw, parsed: safeParse(raw) };
  return cache.parsed;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function persist(next: SavedSalida[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function useSalidasCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const toggle = useCallback((salida: SavedSalida) => {
    const current = getSnapshot();
    const exists = current.some((item) => item.slug === salida.slug);
    persist(exists ? current.filter((item) => item.slug !== salida.slug) : [...current, salida]);
  }, []);

  const remove = useCallback((slug: string) => {
    persist(getSnapshot().filter((item) => item.slug !== slug));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const has = useCallback((slug: string) => items.some((item) => item.slug === slug), [items]);

  return { items, toggle, remove, clear, has };
}
