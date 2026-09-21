import type { Metadata } from "next";
import { AdventureCalendar } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/AdventureCalendar";
import { PublicPageShell } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/PublicPageShell";
import { getCalendarTours } from "@/lib/queries/site-content";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, jsonLdString } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Calendario de aventuras en El Salvador",
  description: "Calendario de salidas de Club de Lobos: fechas de las próximas caminatas, viajes y aventuras guiadas por El Salvador y el mundo. Elige tu fecha y reserva.",
  path: "/calendario",
});

export default async function CalendarPage() {
  const tours = await getCalendarTours();

  return (
    <PublicPageShell currentPath="/calendario" title="Calendario de salidas" bannerImage={tours[0]?.imageUrl ?? null}>
      <main className="px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[1140px]">
          <p className="mb-8 max-w-2xl text-[17px] leading-7 text-[var(--gn-palette-5)]">
            A continuación encontrarás la programación de nuestras próximas aventuras. Selecciona una salida para consultar toda la información y reservar.
          </p>
          <AdventureCalendar tours={tours} />
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(buildBreadcrumbJsonLd([
          { name: "Inicio", url: SITE_URL },
          { name: "Calendario de salidas", url: `${SITE_URL}/calendario` },
        ])) }}
      />
    </PublicPageShell>
  );
}
