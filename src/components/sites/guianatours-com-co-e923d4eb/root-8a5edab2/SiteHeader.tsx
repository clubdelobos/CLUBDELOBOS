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
  PhoneAltIcon,
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

function Logo({ className, logoUrl }: { className?: string; logoUrl: string | null }) {
  return (
    <Link href={HOME_HREF} aria-label="Club de Lobos" className={className}>
      <Image
        src={logoUrl ?? "/brand/lobos/logo-white-640.png"}
        alt="Club de Lobos"
        width={640}
        height={640}
        priority
        className="block h-auto w-[92px] max-[1024px]:w-[90px]"
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
    return () => document.removeEventListener("keydown", onKey);
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
        {/* row 1 — logo / contact / social. Collapses out of the way once the
            header pins so the sticky bar stays compact. */}
        <div
          className={cn(
            "overflow-hidden transition-[height,opacity] duration-300 ease-out",
            scrolled ? "h-0 opacity-0" : "h-[83.47px] opacity-100",
          )}
        >
          <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-5">
            <Logo className="block" logoUrl={logoUrl} />
            <div className="flex items-center gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escríbenos por WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--gn-palette-1)] transition-transform hover:scale-105"
              >
                <WhatsAppGlyph className="h-[15px] w-[15px]" />
              </a>
              <a
                href={phoneHref}
                aria-label={`Llamar: ${phoneLabel}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--gn-palette-1)] transition-transform hover:scale-105"
              >
                <PhoneAltIcon className="h-[15px] w-[15px]" />
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
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--gn-palette-1)] transition-transform hover:scale-105"
                  >
                    <Glyph className="h-[15px] w-[15px]" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* row 2 — primary navigation + cart. Grows tall enough to hold the
            full-size logo once the header pins (row 1 is gone by then). */}
        <div className={cn("transition-[height] duration-300 ease-out", scrolled ? "h-[96px]" : "h-[50px]")}>
          <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-5">
            {scrolled ? <Logo className="block" logoUrl={logoUrl} /> : <div aria-hidden="true" />}
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

      {/* ---------- mobile drawer ---------- */}
      <div
        className={cn(
          "fixed inset-0 z-[999] transition-opacity duration-300 min-[1025px]:hidden",
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          tabIndex={-1}
          onClick={() => setDrawerOpen(false)}
          className="absolute inset-0 h-full w-full cursor-default bg-black/50"
        />
        <div className="absolute inset-y-0 right-0 flex w-[300px] max-w-[85vw] flex-col bg-[var(--gn-palette-1)] p-6">
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
    </header>
  );
}
