"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IDLE_LIMIT_MS, IDLE_WARN_MS } from "@/lib/auth/idle";

/**
 * The client half of the admin idle timeout. The guarantee lives in Proxy
 * (`src/lib/supabase/proxy-session.ts`) — this only adds the niceties on top:
 *
 * - a one-minute "Tu sesión está por cerrarse / Seguir conectado" warning,
 * - an automatic sign-out the moment the deadline passes while the tab is open,
 *   without waiting for the next request,
 * - keeping the server-side `lobos-admin-seen` cookie fresh (via a throttled
 *   ping to `/admin/keepalive`) while the admin is reading/typing on one page
 *   and not triggering navigations of their own.
 *
 * Activity in any admin tab resets the others (localStorage + `storage`), and a
 * tab that was hidden/suspended is re-checked on `visibilitychange`.
 */
const STORAGE_KEY = "lobos:admin-last-active";
const KEEPALIVE_THROTTLE_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

function goToIdleLogout() {
  // A real, full-page navigation (not a Server Action call from an effect, and
  // not a client-side `router.push`) so the sign-out response's Set-Cookie is
  // actually applied and every bit of router/client state is dropped.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/admin/logout?reason=idle");
}

export function IdleLogout() {
  // Landing on the admin shell is itself a deliberate action, so start the
  // clock from now regardless of any stale timestamp a previous session left.
  const [lastActive, setLastActive] = useState<number>(() => Date.now());
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const firedRef = useRef(false);
  const keepaliveUntilRef = useRef(0);

  const pingKeepalive = useCallback(() => {
    const now = Date.now();
    if (now < keepaliveUntilRef.current) return;
    keepaliveUntilRef.current = now + KEEPALIVE_THROTTLE_MS;
    void fetch("/admin/keepalive", { method: "GET", cache: "no-store", keepalive: true }).catch(() => {});
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

  const doLogout = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    goToIdleLogout();
  }, []);

  // `lastActive` already seeds to "now" (arriving on the shell is deliberate);
  // the mount only needs to refresh the server-side activity cookie.
  useEffect(() => {
    pingKeepalive();
  }, [pingKeepalive]);

  useEffect(() => {
    let throttleUntil = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now < throttleUntil) return;
      throttleUntil = now + 5000;
      markActive();
      pingKeepalive();
    };
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, onActivity, { passive: true });
    }
    return () => {
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, onActivity);
    };
  }, [markActive, pingKeepalive]);

  // Activity from a sibling admin tab.
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

  // A tab that was backgrounded may have had its timers frozen — re-check the
  // moment it comes back. (Proxy is the real backstop if the page was frozen
  // long enough that even this check is stale.)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActive >= IDLE_LIMIT_MS) {
        doLogout();
      } else {
        pingKeepalive();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [lastActive, doLogout, pingKeepalive]);

  // The clock.
  useEffect(() => {
    const tick = () => {
      const idleFor = Date.now() - lastActive;
      if (idleFor >= IDLE_LIMIT_MS) {
        doLogout();
      } else if (idleFor >= IDLE_LIMIT_MS - IDLE_WARN_MS) {
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
        onClick={() => {
          markActive();
          pingKeepalive();
        }}
        className="shrink-0 rounded-lg bg-[var(--gn-palette-1)] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--gn-palette-2)]"
      >
        Seguir conectado
      </button>
    </div>
  );
}
