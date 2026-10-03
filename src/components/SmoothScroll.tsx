"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Inertial smooth scrolling for the public site. Off in /admin and for anyone
 * who asked their OS for reduced motion (CSS scroll-behavior still covers anchors). */
export function SmoothScroll() {
  const pathname = usePathname();
  const enabled = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      anchors: { offset: -84 },
      allowNestedScroll: true,
      // Dialogs and the mobile menu lock the page with body overflow:hidden; let that win.
      prevent: () => document.body.style.overflow === "hidden",
    });
    return () => lenis.destroy();
  }, [enabled]);

  return null;
}
