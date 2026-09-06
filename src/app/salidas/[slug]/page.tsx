import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Backpack,
  Ban,
  Camera,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  Flag,
  Gauge,
  Info,
  MapPin,
  Mountain,
  Route,
  Thermometer,
  TrendingUp,
  Trees,
  TentTree,
  UsersRound,
  Waves,
} from "lucide-react";
import { CookieNotice } from "@/components/CookieNotice";
import { PageViewBeacon } from "@/components/analytics/PageViewBeacon";
import { Reveal } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/Reveal";
import { SiteFooter } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/SiteFooter";
import { SiteHeader } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/SiteHeader";
import { TourBookingPanel } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/TourBookingPanel";
import { WhatsAppFab } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/WhatsAppFab";
import {
  getNavLinks,
  getPublishedTourSlugs,
  getSiteSettings,
  getTourBySlug,
} from "@/lib/queries/site-content";
import { getStoredTourDetailRecord, resolveTourDetailCopy } from "@/lib/queries/tour-details";
import type { TourIconId } from "@/lib/tour-details";
import { buildBreadcrumbJsonLd, buildTourEventJsonLd, jsonLdString } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;
export const dynamicParams = true;

interface TourPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [tour, storedDetails] = await Promise.all([getTourBySlug(slug), getStoredTourDetailRecord()]);
  if (!tour) return { title: "Salida no encontrada", robots: { index: false, follow: false } };
  const price = [tour.currencySymbol, tour.price].filter(Boolean).join(" ");
  const detail = resolveTourDetailCopy({ id: tour.id, slug, price }, storedDetails);
  return {
    title: tour.title,
    description: detail.lead,
    alternates: { canonical: `/salidas/${encodeURIComponent(slug)}` },
    openGraph: {
      title: tour.title,
      description: detail.lead,
      images: tour.images.slice(0, 1),
    },
  };
}

const FACT_ICONS: Record<TourIconId, typeof Activity> = {
  compass: Compass,
  activity: Activity,
  gauge: Gauge,
  clock: Clock3,
  mountain: Mountain,
  elevation: TrendingUp,
  temperature: Thermometer,
  trees: Trees,
  route: Route,
  people: UsersRound,
  price: CircleDollarSign,
  tent: TentTree,
  camera: Camera,
  waves: Waves,
};

interface GalleryImage { url: string; width: number; height: number }

/**
 * Pure server markup, no client JS — a lightbox or carousel would add
 * interactivity but also the one thing this must never have: lag on first
 * paint. Five fixed layouts (1-5 photos) cover every case a tour can have.
 */
function TourGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [first, ...rest] = images;
  if (!first) return null;

  if (images.length === 1) {
    return (
      <section className="relative h-[190px] overflow-hidden bg-[var(--gn-palette-2)] sm:h-[280px]">
        <Image src={first.url} alt={title} fill priority sizes="100vw" className="object-cover object-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[var(--gn-palette-2)]/70" />
      </section>
    );
  }

  return (
    <section className="relative h-[220px] overflow-hidden bg-[var(--gn-palette-2)] sm:h-[320px]">
      <div className={`grid h-full gap-0.5 ${images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        <div className={`relative h-full ${images.length > 2 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
          <Image src={first.url} alt={title} fill priority sizes="(max-width: 640px) 50vw, 50vw" className="object-cover object-center" />
        </div>
        {rest.slice(0, 4).map((image, index) => (
          <div key={image.url} className={`relative h-full ${index === 0 ? "" : "hidden sm:block"}`}>
            <Image src={image.url} alt={title} fill sizes="25vw" className="object-cover object-center" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[var(--gn-palette-2)]/60" />
    </section>
  );
}

const INFORMATION_SECTIONS = [
  {
    title: "Antes de salir",
    icon: Info,
    body: "Te enviaremos el punto de encuentro, horario definitivo y recomendaciones cuando confirmemos tu solicitud.",
  },
  {
    title: "Qué haremos",
    icon: Route,
    body: "Compartiremos la ruta con la manada, respetando el ritmo del grupo, el entorno y las indicaciones de seguridad.",
  },
  {
    title: "Qué incluye",
    icon: Check,
    body: "Coordinación previa, acompañamiento del grupo y orientación general durante la experiencia. Los servicios específicos se detallan al confirmar.",
  },
  {
    title: "Qué llevar",
    icon: Backpack,
    body: "Ropa cómoda, calzado adecuado, agua, protección solar y los artículos particulares que indiquemos para el destino.",
  },
  {
    title: "Qué no llevar",
    icon: Ban,
    body: "Evita objetos innecesarios, envases desechables y cualquier elemento que pueda afectar el entorno o dificultar la caminata.",
  },
] as const;

const ITINERARY_STEPS = [
  {
    icon: MapPin,
    title: "Punto de encuentro",
    body: "Lugar y hora por confirmar con las personas inscritas.",
  },
  {
    icon: Compass,
    title: "Experiencia",
    body: "Recorrido, pausas y actividades de acuerdo con el destino y las condiciones del día.",
  },
  {
    icon: Flag,
    title: "Regreso",
    body: "El horario estimado se compartirá junto con el itinerario definitivo.",
  },
] as const;

export default async function TourPage({ params }: TourPageProps) {
  const { slug } = await params;
  const [tour, settings, navLinks, storedDetails] = await Promise.all([
    getTourBySlug(slug),
    getSiteSettings(),
    getNavLinks("/proximas-salidas"),
    getStoredTourDetailRecord(),
  ]);
  if (!tour) notFound();

  const price = [tour.currencySymbol, tour.price].filter(Boolean).join(" ");
  const detail = resolveTourDetailCopy({ id: tour.id, slug, price }, storedDetails);
  const duration = detail.facts.find((fact) => fact.key === "time")?.value ?? "Por confirmar";
  const visibleFacts = detail.facts.filter((fact) => fact.enabled);
  const eventJsonLd = buildTourEventJsonLd({
    title: tour.title,
    slug,
    departureDates: tour.departureDates,
    description: detail.lead,
    imageUrl: tour.images[0]?.url,
    price: tour.price,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: SITE_URL },
    { name: "Próximas salidas", url: `${SITE_URL}/proximas-salidas` },
    { name: tour.title, url: `${SITE_URL}/salidas/${encodeURIComponent(slug)}` },
  ]);

  return (
    <div
      className="relative w-full bg-white"
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

      <TourGallery images={tour.images} title={tour.title} />

      <main className="px-5 py-10 sm:py-14">
        <div className="mx-auto max-w-[1140px]">
          <Link
            href="/proximas-salidas"
            className="mb-6 inline-flex text-sm font-semibold text-[var(--gn-palette-1)] hover:underline"
          >
            ← Volver a próximas aventuras
          </Link>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <article className="min-w-0">
              <header>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--gn-palette-1)]">
                  Club de Lobos · El Salvador
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--gn-palette-3)] sm:text-4xl">
                  {tour.title}
                </h1>
                <h2 className="mt-1 text-lg font-bold text-[var(--gn-palette-3)]">Información general de la salida</h2>
              </header>

              <Reveal as="div" className="mt-8 space-y-5 text-[17px] leading-7 text-[var(--gn-palette-5)]">
                <p className="font-medium text-[var(--gn-palette-3)]">{detail.lead}</p>
                {detail.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </Reveal>

              {visibleFacts.length > 0 ? (
              <section aria-label="Datos de la salida" className="mt-9 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {visibleFacts.map((fact, index) => {
                  const Icon = FACT_ICONS[fact.icon] ?? Activity;
                  return (
                    <Reveal
                      key={fact.key}
                      zoom
                      delay={Math.min(index, 5) * 45}
                      className="gn-fact-card flex min-h-36 flex-col items-center justify-center rounded-2xl bg-[var(--gn-palette-7)] p-3 text-center outline-none ring-1 ring-black/[0.03] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--gn-palette-7)]/70 hover:shadow-[0_14px_30px_rgba(18,39,31,0.12)] focus-visible:ring-2 focus-visible:ring-[var(--gn-palette-1)]/40"
                    >
                      <span tabIndex={0} className="flex flex-col items-center outline-none">
                        <Icon strokeWidth={1.55} className={`gn-fact-icon gn-fi-${fact.icon} mb-3 h-11 w-11 text-[var(--gn-palette-1)]`} />
                        <strong className="text-sm text-[var(--gn-palette-3)]">{fact.label}</strong>
                        <span className="mt-1 text-[11px] leading-4 text-[var(--gn-palette-5)]">{fact.value}</span>
                      </span>
                    </Reveal>
                  );
                })}
              </section>
              ) : null}

              <Reveal as="section" className="mt-10 rounded-2xl bg-[var(--gn-palette-8)] p-5 ring-1 ring-black/[0.04] sm:p-7">
                <h2 className="text-xl font-extrabold text-[var(--gn-palette-3)]">Itinerario general</h2>
                <ol className="mt-6 space-y-6">
                  {ITINERARY_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <li key={step.title} className="relative flex gap-4 pl-1">
                        {index < ITINERARY_STEPS.length - 1 ? (
                          <span aria-hidden className="absolute left-[19px] top-11 h-[calc(100%-4px)] w-px bg-[var(--gn-palette-7)]" />
                        ) : null}
                        <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--gn-palette-1)] text-white">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                        </span>
                        <div className="pt-1">
                          <p className="font-bold text-[var(--gn-palette-1)]">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--gn-palette-5)]">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Reveal>

              <section className="mt-8 space-y-2.5">
                {INFORMATION_SECTIONS.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <Reveal key={section.title} delay={index * 45}>
                      <details className="group overflow-hidden rounded-xl border border-black/10 bg-white transition-colors open:border-[var(--gn-palette-1)]/30 open:bg-[var(--gn-palette-8)]">
                        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-bold text-[var(--gn-palette-3)]">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gn-palette-7)] text-[var(--gn-palette-1)]">
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="flex-1">{section.title}</span>
                          <span className="text-xl font-normal text-[var(--gn-palette-1)] transition-transform duration-200 group-open:rotate-45">+</span>
                        </summary>
                        <p className="px-4 pb-4 pl-15 text-sm leading-6 text-[var(--gn-palette-5)]">{section.body}</p>
                      </details>
                    </Reveal>
                  );
                })}
              </section>
            </article>

            <TourBookingPanel
              tourId={tour.id}
              tourSlug={tour.slug}
              tourTitle={tour.title}
              tourImage={tour.images[0]?.url}
              departureDates={tour.departureDates}
              duration={duration}
              price={price}
            />
          </div>
        </div>
      </main>

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
      <WhatsAppFab
        phoneHref={settings.phoneHref}
        message={`Hola, quiero información sobre la salida "${tour.title}" de Club de Lobos:\n${SITE_URL}/salidas/${encodeURIComponent(slug)}`}
      />
      <CookieNotice />
      <PageViewBeacon />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(eventJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }} />
    </div>
  );
}
