"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "lobos-cookie-notice-v1";
const CHANGE_EVENT = "lobos-cookie-notice-change";
let dismissedForSession = false;

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getSnapshot() {
  if (dismissedForSession) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "acknowledged";
  } catch {
    return true;
  }
}

export function CookieNotice() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function acknowledge() {
    dismissedForSession = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {
      // The notice can still be dismissed for this visit when storage is blocked.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  if (!visible) return null;

  return (
    <aside
      id="aviso-cookies"
      role="dialog"
      aria-label="Aviso de cookies"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[1000] mx-auto flex max-w-[720px] flex-col gap-4 rounded-2xl border border-white/15 bg-[var(--gn-palette-2)] p-4 text-white shadow-2xl sm:flex-row sm:items-center sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Aviso de cookies</p>
        <p className="mt-1 text-xs leading-5 text-white/80">
          Este sitio utiliza únicamente almacenamiento técnico y una medición de visitas anónima. No usamos cookies
          publicitarias ni compartimos tus datos.{" "}
          <Link href="/legal/cookies" className="font-semibold text-[var(--gn-palette-7)] underline underline-offset-2">
            Más información
          </Link>
          .
        </p>
      </div>
      <button
        type="button"
        onClick={acknowledge}
        className="shrink-0 rounded-lg bg-[var(--gn-palette-7)] px-5 py-2.5 text-sm font-bold text-[var(--gn-palette-2)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Entendido
      </button>
    </aside>
  );
}
