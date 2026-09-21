import type { Metadata } from "next";
import { AdventureBrowser } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/AdventureBrowser";
import { PublicPageShell } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/PublicPageShell";
import { getTours } from "@/lib/queries/site-content";
import { humanizeTitle, pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdString } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Próximas salidas y aventuras en El Salvador",
  description: "Próximas salidas de Club de Lobos: senderismo en volcanes, ríos y pueblos vivos de El Salvador, camping y viajes internacionales guiados. Consulta fechas, precios y reserva.",
  path: "/proximas-salidas",
});

export default async function UpcomingToursPage() {
  const tours = await getTours();
  const itemList = buildItemListJsonLd("Próximas salidas de Club de Lobos", tours.map((tour) => ({
    name: humanizeTitle(tour.title),
    url: `${SITE_URL}${tour.href}`,
    image: tour.image || undefined,
  })));
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Inicio", url: SITE_URL },
    { name: "Próximas salidas", url: `${SITE_URL}/proximas-salidas` },
  ]);

  return (
    <PublicPageShell currentPath="/proximas-salidas" title="Próximas aventuras en El Salvador" bannerImage={tours[0]?.image ?? null}>
      <main className="bg-[var(--gn-palette-8)] px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[1140px]">
          <p className="mb-9 max-w-2xl text-[17px] leading-7 text-[var(--gn-palette-5)]">
            ¡Ven con la manada! Conoce nuevos destinos de El Salvador y abre cada salida para consultar la ruta, fecha, dificultad y demás información.
          </p>
          {tours.length ? (
            <AdventureBrowser tours={tours} />
          ) : (
            <p className="rounded-xl bg-white p-8 text-center text-[var(--gn-palette-5)]">Pronto publicaremos nuevas salidas.</p>
          )}
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
    </PublicPageShell>
  );
}
