import Image from "next/image";
import { CookieNotice } from "@/components/CookieNotice";
import { PageViewBeacon } from "@/components/analytics/PageViewBeacon";
import { getNavLinks, getSiteSettings } from "@/lib/queries/site-content";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhatsAppFab } from "./WhatsAppFab";

interface PublicPageShellProps {
  currentPath: string;
  title: string;
  eyebrow?: string;
  bannerImage?: string | null;
  children: React.ReactNode;
}

export async function PublicPageShell({
  currentPath,
  title,
  eyebrow = "Club de Lobos · El Salvador",
  bannerImage,
  children,
}: PublicPageShellProps) {
  const [settings, navLinks] = await Promise.all([
    getSiteSettings(),
    getNavLinks(currentPath),
  ]);

  return (
    <div
      className="relative min-h-screen w-full bg-white"
      style={{
        "--gn-palette-1": settings.palette[1],
        "--gn-palette-2": settings.palette[2],
        "--gn-palette-3": settings.palette[3],
        "--gn-palette-5": settings.palette[5],
        "--gn-palette-7": settings.palette[7],
        "--gn-palette-8": settings.palette[8],
      } as React.CSSProperties}
    >
      <SiteHeader
        navLinks={navLinks}
        socialLinks={settings.socialLinks}
        phoneLabel={settings.phoneLabel}
        phoneHref={settings.phoneHref}
        logoUrl={settings.logoHeaderUrl}
      />

      <section className="relative flex min-h-[245px] items-end overflow-hidden bg-[var(--gn-palette-2)] px-5 pb-9 pt-36 sm:min-h-[285px] sm:pb-11">
        {bannerImage ? (
          <Image src={bannerImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-50" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[var(--gn-palette-2)]/90" />
        <div className="relative mx-auto w-full max-w-[1140px]">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--gn-palette-7)]">{eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">{title}</h1>
        </div>
      </section>

      {children}

      <SiteFooter
        navLinks={navLinks}
        socialLinks={settings.socialLinks}
        phoneLabel={settings.phoneLabel}
        phoneHref={settings.phoneHref}
        email={settings.email}
        logoUrl={settings.logoFooterUrl}
        registro={settings.footerRegistro}
        copyright={settings.footerCopyright}
        creditLabel={settings.footerCreditLabel}
        creditHref={settings.footerCreditHref}
      />
      <WhatsAppFab phoneHref={settings.phoneHref} />
      <CookieNotice />
      <PageViewBeacon />
    </div>
  );
}
