"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EnvelopeIcon,
  FacebookCircleIcon,
  InstagramBrandIcon,
  PhoneSolidIcon,
  YoutubeBrandIcon,
} from "@/components/sites/guianatours-com-co-e923d4eb/shared/icons";
import { WhatsAppGlyph } from "@/components/sites/guianatours-com-co-e923d4eb/shared/WhatsAppGlyph";
import { track } from "@/lib/analytics/track";
import type { NavLink, SocialLink } from "@/types/guianatours-com-co-e923d4eb";
import { FOOTER } from "./content";

const SOCIAL_GLYPH = {
  facebook: FacebookCircleIcon,
  instagram: InstagramBrandIcon,
  youtube: YoutubeBrandIcon,
} as const;

/** Column wrapper: 20px padding plus the 1px cream divider (last column has none). */
function FooterColumn({
  children,
  divider = true,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className="flex min-[768px]:w-1/4">
      <div
        className={cn(
          "w-full p-5",
          divider && "min-[768px]:border-r min-[768px]:border-[var(--gn-palette-8)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Elementor heading widget: h3 18px/18px bold white, widget margin-bottom 20px.
 * The "Mapa del sitio" heading additionally gains 20px of internal margin below
 * 768px (measured: its widget box is 18px at 1440 and 38px at 390); "Legal"
 * does not. `flex flex-col` keeps the h3's margin inside the widget box.
 */
function FooterHeading({
  children,
  mobileGap = false,
}: {
  children: React.ReactNode;
  mobileGap?: boolean;
}) {
  return (
    <div className="mb-5 flex flex-col">
      <h3
        className={cn(
          "text-center text-[18px] leading-[18px] font-bold text-white",
          mobileGap && "max-[767px]:mb-5",
        )}
      >
        {children}
      </h3>
    </div>
  );
}

export interface SiteFooterProps {
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  phoneLabel: string;
  phoneHref: string;
  email: string;
  logoUrl: string | null;
  registro: string | null;
  copyright: string;
  creditLabel: string;
  creditHref: string | null;
}

export function SiteFooter({
  navLinks,
  socialLinks,
  phoneLabel,
  phoneHref,
  email,
  logoUrl,
  registro,
  copyright,
  creditLabel,
  creditHref,
}: SiteFooterProps) {
  return (
    <footer>
      {/* ---------- section 4da3f5a — four columns ---------- */}
      <section className="relative bg-[var(--gn-palette-1)] px-5 pb-5 pt-10">
        <div className="mx-auto flex max-w-[1140px] flex-col min-[768px]:flex-row">
          <FooterColumn>
            <Image
              src={logoUrl ?? "/brand/lobos/logo-white-1024.png"}
              alt="Club de Lobos"
              width={1080}
              height={1080}
              className="mx-auto mb-5 block h-auto w-[244px] max-[767px]:w-[310px]"
              sizes="(max-width: 767px) 310px, 244px"
            />
            {registro ? (
              <p className="m-0 text-center text-[14px] leading-[14px] font-normal text-white">{registro}</p>
            ) : null}
          </FooterColumn>

          <FooterColumn>
            <FooterHeading mobileGap>{FOOTER.sitemapHeading}</FooterHeading>
            <nav aria-label="Mapa del sitio">
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      aria-current={link.active ? "page" : undefined}
                      className={cn(
                        "flex py-[2px] text-[14px] leading-5 font-normal transition-colors hover:text-[var(--gn-palette-7)]",
                        link.active ? "text-[var(--gn-palette-7)]" : "text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </FooterColumn>

          <FooterColumn>
            <FooterHeading>{FOOTER.legalHeading}</FooterHeading>
            <ul>
              {FOOTER.legalLinks.map((link) => (
                <li key={link.label} className="flex pb-[2px] text-center">
                  <Link
                    href={link.href}
                    className="w-full text-center text-[14px] leading-[22.4px] font-normal text-white transition-colors hover:text-[var(--gn-palette-7)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn divider={false}>
            <h3 className="mb-[10px] text-center text-[18px] leading-[18px] font-bold text-white">
              {FOOTER.subscribeHeading}
            </h3>
            <p className="mb-4 text-center text-[13px] leading-5 text-white/70">{FOOTER.subscribeBody}</p>
            <div className="flex flex-col gap-2.5 px-[5px]">
              <a
                href={`https://wa.me/${phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(
                  "Hola, quiero enterarme de las próximas salidas de Club de Lobos.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("cta_click", "footer_whatsapp")}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <WhatsAppGlyph className="h-4 w-4" />
                Escríbenos por WhatsApp
              </a>
              {socialLinks
                .filter((s) => s.network === "instagram")
                .map((s) => (
                  <a
                    key={s.network}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("social_click", "instagram")}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--gn-palette-7)] px-4 text-[14px] font-bold text-[var(--gn-palette-1)] transition-opacity hover:opacity-90"
                  >
                    <InstagramBrandIcon className="h-4 w-4" />
                    Síguenos en Instagram
                  </a>
                ))}
            </div>
          </FooterColumn>
        </div>
      </section>

      {/* ---------- section 21cf77c — contact bar ---------- */}
      <section className="relative bg-[var(--gn-palette-1)] px-5 pb-10 pt-5">
        <div className="mx-auto flex max-w-[1140px] flex-col min-[768px]:flex-row">
          <div className="flex items-center p-[10px] min-[768px]:w-1/2">
            <ul className="-mx-2 flex flex-wrap max-[767px]:w-full max-[767px]:justify-center">
              <li className="mx-2 flex items-center">
                <a href={phoneHref} onClick={() => track("cta_click", "phone")} className="flex items-center text-white">
                  <PhoneSolidIcon className="h-[14px] w-[14px] shrink-0" />
                  <span className="pl-[5px] text-[14px] leading-[22.4px] font-normal text-white">{phoneLabel}</span>
                </a>
              </li>
              {email ? (
                <li className="mx-2 flex items-center">
                  <a href={`mailto:${email}`} className="flex items-center text-white">
                    <EnvelopeIcon className="h-[14px] w-[14px] shrink-0" />
                    <span className="pl-[5px] text-[14px] leading-[22.4px] font-normal text-white">{email}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="flex items-center p-[10px] min-[768px]:w-1/2">
            <div className="flex w-full justify-center gap-[5px] min-[768px]:justify-end">
              {socialLinks.map((social) => {
                const Glyph = SOCIAL_GLYPH[social.network];
                return (
                  <a
                    key={social.network}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("social_click", social.network)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--gn-palette-1)]"
                  >
                    <span className="sr-only">{social.label}</span>
                    <Glyph className="h-[14px] w-[14px]" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- section b4821ba — copyright ---------- */}
      <section className="relative bg-[var(--gn-palette-2)]">
        {/* the copy widget carries an 80px bottom margin below 768px */}
        <div className="mx-auto max-w-[1140px] p-[10px]">
          <p className="my-[17px] text-center text-[17px] leading-[27.2px] font-normal text-white max-[767px]:mb-20">
            {copyright}
            {creditHref ? (
              <a href={creditHref} target="_blank" rel="noopener" className="font-bold text-white">
                {creditLabel}
              </a>
            ) : (
              <span className="font-bold text-white">{creditLabel}</span>
            )}
          </p>
        </div>
      </section>
    </footer>
  );
}
