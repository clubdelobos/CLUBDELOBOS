"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EnvelopeIcon,
  FacebookCircleIcon,
  InstagramBrandIcon,
  PhoneSolidIcon,
  TiktokBrandIcon,
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
  tiktok: TiktokBrandIcon,
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
            <FooterHeading>{FOOTER.subscribeHeading}</FooterHeading>
            <p className="mb-4 text-center text-[13px] leading-5 text-white/70">
              {FOOTER.subscribeBody} Síguenos en nuestras redes sociales:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={`https://wa.me/${phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(
                  "Hola, quiero enterarme de las próximas salidas de Club de Lobos.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escríbenos por WhatsApp"
                onClick={() => track("cta_click", "footer_whatsapp")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[var(--gn-palette-7)] hover:text-[var(--gn-palette-1)]"
              >
                <WhatsAppGlyph className="h-[18px] w-[18px]" />
              </a>
              {socialLinks.map((social) => {
                const Glyph = SOCIAL_GLYPH[social.network];
                return (
                  <a
                    key={social.network}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    onClick={() => track("social_click", social.network)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[var(--gn-palette-7)] hover:text-[var(--gn-palette-1)]"
                  >
                    <Glyph className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center gap-1.5 border-t border-white/10 pt-5">
              <a href={phoneHref} onClick={() => track("cta_click", "phone")} className="inline-flex items-center gap-2 text-[13px] font-medium text-white transition-colors hover:text-[var(--gn-palette-7)]">
                <PhoneSolidIcon className="h-3.5 w-3.5 shrink-0" />
                {phoneLabel}
              </a>
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-white transition-colors hover:text-[var(--gn-palette-7)]">
                  <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
                  {email}
                </a>
              ) : null}
            </div>
          </FooterColumn>
        </div>
      </section>

      {/* ---------- section b4821ba — copyright ---------- */}
      <section className="relative bg-[var(--gn-palette-2)]">
        {/* the copy widget carries an 80px bottom margin below 768px */}
        <div className="mx-auto max-w-[1140px] p-[10px]">
          <p className="my-[17px] text-center text-[15px] leading-6 font-normal text-white">
            {copyright}
            {creditLabel ? " " : null}
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
