import Link from "next/link";

/**
 * Crawlable brand copy for the homepage. The rest of the page is images and
 * short headings (which the admin can edit freely), so without this Google has
 * almost no text tying "Club de Lobos" to El Salvador, hiking and tours. Also
 * gives the home real internal links with descriptive anchor text.
 */
export function SeoIntro() {
  return (
    <section aria-labelledby="seo-intro-title" className="px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-[1140px]">
        <h2 id="seo-intro-title" className="max-w-3xl text-2xl font-bold leading-tight text-[var(--gn-palette-3)] sm:text-[28px]">
          Senderismo, camping y viajes guiados en El Salvador
        </h2>
        <div className="mt-5 grid gap-8 text-[16px] leading-7 text-[var(--gn-palette-5)] lg:grid-cols-2 lg:gap-14">
          <div className="space-y-4">
            <p>
              <strong className="font-semibold text-[var(--gn-palette-3)]">Club de Lobos</strong> es una tour operadora salvadoreña
              (también conocida como Lobos SV) que organiza salidas de senderismo, camping y viajes con guías expertos. Cada aventura
              se comunica con ruta, punto de encuentro y recomendaciones para que llegues preparado y disfrutes en manada.
            </p>
            <p>
              Nuestras salidas nacionales recorren los ríos, los pueblos vivos y los volcanes de El Salvador. Si buscas ir más lejos,
              también organizamos viajes internacionales guiados desde El Salvador.
            </p>
          </div>
          <ul className="space-y-3">
            <li>
              <Link href="/proximas-salidas" className="font-semibold text-[var(--gn-palette-1)] hover:underline">
                Próximas salidas de senderismo y viajes
              </Link>
              <span> — rutas, fechas y precios de cada aventura.</span>
            </li>
            <li>
              <Link href="/calendario" className="font-semibold text-[var(--gn-palette-1)] hover:underline">
                Calendario de aventuras en El Salvador
              </Link>
              <span> — elige tu fecha y solicita tu reserva.</span>
            </li>
            <li>
              <Link href="/club-de-lobos" className="font-semibold text-[var(--gn-palette-1)] hover:underline">
                Conoce a Club de Lobos
              </Link>
              <span> — quiénes somos y cómo viajamos.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
