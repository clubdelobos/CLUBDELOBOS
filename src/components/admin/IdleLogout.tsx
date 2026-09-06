"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logoutForInactivity } from "@/app/admin/login/actions";

/**
 * Signs the admin out after 15 minutes with no interaction. Covers the "walked
 * away from an unlocked screen" case — the Supabase JWT keeps its own (shorter,
 * server-side) lifetime on top of this.
 *
 * - Activity in any admin tab resets the timer for all of them (localStorage +
 *   the `storage` event).
 * - A tab that was hidden/suspended (laptop lid closed) is re-checked the
 *   moment it becomes visible again, and on mount, so a stale session can't
 *   survive by the timer simply not having ticked.
 * - One minute before the deadline a prompt appears with a "Seguir conectado"
 *   button.
 */
const IDLE_LIMIT_MS = 15 * 60 * 1000;
const WARN_BEFORE_MS = 60 * 1000;
const STORAGE_KEY = "lobos:admin-last-active";
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

function readLastActive(): number {
  if (typeof window === "undefined") return Date.now();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : Date.now();
  } catch {
    return Date.now();
  }
}

export function IdleLogout() {
  const [lastActive, setLastActive] = useState<number>(readLastActive);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const firedRef = useRef(false);

  const doLogout = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void logoutForInactivity().catch(() => {});
    // Backstop in case the Server Action redirect doesn't take. A hard load is
    // intentional here: after sign-out every bit of client/router state must be
    // dropped and the proxy re-evaluated from scratch.
    window.setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin/login?reason=idle");
    }, 1500);
  }, []);

  const markActive = useCallback(() => {
    const now = Date.now();
    setLastActive(now);
    setSecondsLeft(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      /* private mode — the in-memory timer still works */
    }
  }, []);

  // Seed a shared timestamp on first mount so sibling tabs start in sync
  // (without stomping a fresher value another tab may have already written).
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    } catch {
      /* private mode */
    }
  }, []);

  // Record activity (throttled so we're not writing localStorage on every event).
  useEffect(() => {
    let throttleUntil = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now < throttleUntil) return;
      throttleUntil = now + 5000;
      markActive();
    };
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, onActivity, { passive: true });
    }
    return () => {
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, onActivity);
    };
  }, [markActive]);

  // Pick up activity from other admin tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      const parsed = Number(e.newValue);
      if (Number.isFinite(parsed)) {
        setLastActive(parsed);
        setSecondsLeft(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Re-check when the tab becomes visible again (it may have been suspended).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const fresh = readLastActive();
      setLastActive(fresh);
      if (Date.now() - fresh >= IDLE_LIMIT_MS) doLogout();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [doLogout]);

  // The clock.
  useEffect(() => {
    const tick = () => {
      const idleFor = Date.now() - lastActive;
      if (idleFor >= IDLE_LIMIT_MS) {
        doLogout();
      } else if (idleFor >= IDLE_LIMIT_MS - WARN_BEFORE_MS) {
        setSecondsLeft(Math.max(1, Math.ceil((IDLE_LIMIT_MS - idleFor) / 1000)));
      } else {
        setSecondsLeft(null);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lastActive, doLogout]);

  if (secondsLeft === null) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Sesión por expirar"
      className="fixed inset-x-0 bottom-4 z-[2000] mx-auto flex w-[min(420px,calc(100%-2rem))] items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_26px_64px_-14px_rgba(0,0,0,0.45)]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[var(--gn-palette-3)]">Tu sesión está por cerrarse</p>
        <p className="mt-0.5 text-xs text-[var(--gn-palette-5)]">
          Por inactividad, se cerrará en {secondsLeft}s.
        </p>
      </div>
      <button
        type="button"
        onClick={markActive}
        className="shrink-0 rounded-lg bg-[var(--gn-palette-1)] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--gn-palette-2)]"
      >
        Seguir conectado
      </button>
    </div>
  );
}
