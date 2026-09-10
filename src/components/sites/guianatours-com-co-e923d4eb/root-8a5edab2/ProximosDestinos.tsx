import { AdventureBrowser } from "./AdventureBrowser";
import type { ProductCard as ProductCardData } from "@/types/guianatours-com-co-e923d4eb";

/** Section a3125aa — cream band with the upcoming-departure product cards,
 *  filtered by category (Nacionales / Internacionales) and, for Nacionales,
 *  by subcategory. */
export function ProximosDestinos({ tours }: { tours: ProductCardData[] }) {
  return (
    <section id="proximas-aventuras" className="relative bg-[var(--gn-palette-8)] px-5 pb-10 pt-[10px]">
      <div className="mx-auto flex max-w-[1140px] flex-col">
        <div className="gn-widget-wrap flex flex-col">
          {/* Elementor heading widget carries margin-bottom: 20px on top of the h2's 12px */}
          <div className="mb-5">
            <h2 className="mb-3 text-center text-2xl leading-6 font-bold text-[var(--gn-palette-3)]">
              Próximas aventuras
            </h2>
          </div>
          <AdventureBrowser tours={tours} />
        </div>
      </div>
    </section>
  );
}
