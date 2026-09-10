import type { Metadata } from "next";
import { AdventureBrowser } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/AdventureBrowser";
import { PublicPageShell } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/PublicPageShell";
import { getTours } from "@/lib/queries/site-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Próximas salidas",
  description: "Descubre las próximas caminatas, viajes y aventuras guiadas de Club de Lobos en El Salvador: fechas, precios y rutas de senderismo y camping.",
  alternates: { canonical: "/proximas-salidas" },
};

export default async function UpcomingToursPage() {
  const tours = await getTours();

  return (
    <PublicPageShell currentPath="/proximas-salidas" title="Nuestras próximas aventuras" bannerImage={tours[0]?.image ?? null}>
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
    </PublicPageShell>
  );
}
