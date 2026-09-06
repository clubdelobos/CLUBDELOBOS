"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  MenuIcon,
  TiktokBrandIcon,
  YoutubeIcon,
} from "@/components/sites/guianatours-com-co-e923d4eb/shared/icons";
import { WhatsAppGlyph } from "@/components/sites/guianatours-com-co-e923d4eb/shared/WhatsAppGlyph";
import { SalidasCart } from "./SalidasCart";
import type { NavLink, SocialLink } from "@/types/guianatours-com-co-e923d4eb";

const HOME_HREF = "/";

const SOCIAL_GLYPH = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokBrandIcon,
} as const;

function Logo({
  className,
  logoUrl,
  compact,
}: {
  className?: string;
  logoUrl: string | null;
  compact?: boolean;
}) {
  return (
    <Link href={HOME_HREF} aria-label="Club de Lobos" className={className}>
      <Image
        src={logoUrl ?? "/brand/lobos/logo-white-640.png"}
        alt="Club de Lobos"
        width={640}
        height={640}
        priority
        // The source PNG carries ~10% transparent padding top and bottom, so the
        // box is sized larger than the stack next to it to make the *visible*
        // wolf span the same height. At the top the stack is contact + nav
        // (~72px -> 90px box); once pinned only the nav remains (~48px box).
        // Centred by the row's items-center.
        className={cn(
          "block w-[86px] transition-[height] duration-300 ease-out max-[1024px]:h-auto min-[1025px]:w-auto",
          compact ? "min-[1025px]:h-[52px]" : "min-[1025px]:h-[90px]",
        )}
      />
    </Link>
  );
}

export interface SiteHeaderProps {
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  phoneLabel: string;
  phoneHref: string;
  logoUrl: string | null;
}

export function SiteHeader({ navLinks, socialLinks, phoneLabel, phoneHref, logoUrl }: SiteHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // "top": overlays the hero, transparent, scrolls away (original behaviour).
  // "pinned": scrolled down and the user is scrolling back up — a solid bar
  // slides in and stays. "hidden": scrolled down and still going down.
  const [mode, setMode] = useState<"top" | "pinned" | "hidden">("top");

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // Freeze the page behind the open drawer.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const evaluate = () => {
      const y = window.scrollY;
      if (y < 120) setMode("top");
      else if (y > lastY + 6) setMode("hidden");
      else if (y < lastY - 6) setMode("pinned");
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrolled = mode !== "top";
  const waHref = `https://wa.me/${phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hola, quiero más información sobre las próximas salidas de Club de Lobos.",
  )}`;

  return (
    <>
    <header
      className={cn(
        "inset-x-0 top-0 z-[100] transition-[transform,background-color,box-shadow] duration-300 ease-out",
        scrolled
          ? "gn-header-pinned fixed shadow-[0_6px_22px_rgba(0,0,0,0.18)]"
          : "absolute bg-transparent",
        mode === "hidden" && !drawerOpen ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {/* ---------- desktop header (>=1025px) ---------- */}
      <div className="hidden min-[1025px]:block">
        <div
          className={cn(
            "mx-auto flex max-w-[1140px] items-center justify-between gap-8 px-5 transition-[padding] duration-300 ease-out",
            scrolled ? "py-2" : "py-2.5",
          )}
        >
          {/* Logo is vertically centred against the whole right-hand stack, so
              it lines up with both the contact row and the nav row. */}
          <Logo className="flex shrink-0 items-center" logoUrl={logoUrl} compact={scrolled} />

          <div className="flex flex-col items-end gap-1">
            {/* contact row — collapses away once the header pins */}
            <div
              className={cn(
                "flex items-center gap-4 overflow-hidden text-white transition-[max-height,opacity] duration-300 ease-out",
                scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
              )}
            >
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escríbenos por WhatsApp"
                className="transition-colors hover:text-[var(--gn-palette-7)]"
              >
                <WhatsAppGlyph className="h-5 w-5" />
              </a>
              {socialLinks.map((social) => {
                const Glyph = SOCIAL_GLYPH[social.network];
                return (
                  <a
                    key={social.network}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[var(--gn-palette-7)]"
                  >
                    <Glyph className="h-5 w-5" />
                  </a>
                );
              })}
              <a
                href={phoneHref}
                className="pl-1 text-[15px] font-normal leading-tight transition-colors hover:text-[var(--gn-palette-7)]"
              >
                {phoneLabel}
              </a>
            </div>

            {/* nav row */}
            <div className="flex items-center">
              <nav aria-label="Menú principal">
                <ul className="flex items-center">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        aria-current={link.active ? "page" : undefined}
                        className={cn(
                          "block p-[10.2px] text-[17px] leading-[27.2px] font-normal transition-colors duration-200 ease-in-out hover:text-[var(--gn-palette-7)]",
                          link.active ? "text-[var(--gn-palette-7)]" : "text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <SalidasCart phoneHref={phoneHref} className="pl-[17px]" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- mobile header (<=1024px) ---------- */}
      <div className="min-[1025px]:hidden">
        <div
          className={cn(
            "flex items-center justify-between px-[5px] transition-[height] duration-300 ease-out min-[768px]:px-5",
            scrolled ? "h-[78px] min-[768px]:h-[72px]" : "h-[92px] min-[768px]:h-[75px]",
          )}
        >
          <Logo className="block" logoUrl={logoUrl} />
          <div className="flex items-center gap-[10px]">
            <SalidasCart phoneHref={phoneHref} />
            <button
              type="button"
              id="mobile-toggle"
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="flex h-[41.19px] w-[46.78px] items-center justify-center rounded-lg bg-white/[0.03] px-[8.4px] py-[5.6px] text-white"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

    </header>

      {/* ---------- mobile drawer ----------
          Rendered as a sibling of <header>, NOT inside it: the header carries a
          `transform` (the hide-on-scroll translate), which would otherwise make
          this `fixed` overlay resolve against the ~90px header box instead of
          the viewport. The panel is always fully opaque with a hard colour
          fallback and slides in on a transform (compositor-only, and it still
          lands in the right place even if a transition is dropped). */}
      <div
        className={cn(
          "fixed inset-0 z-[999] min-[1025px]:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 h-full w-full cursor-default bg-black/60 transition-opacity duration-300 ease-out",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[300px] max-w-[85vw] flex-col overflow-y-auto bg-[var(--gn-palette-1,#1f2430)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out will-change-transform",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className="self-end p-2 text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          <nav aria-label="Menú móvil" className="mt-4">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={link.active ? "page" : undefined}
                    className={cn(
                      "block py-3 text-[17px] leading-[27.2px] transition-colors duration-200 ease-in-out hover:text-[var(--gn-palette-7)]",
                      link.active ? "text-[var(--gn-palette-7)]" : "text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
