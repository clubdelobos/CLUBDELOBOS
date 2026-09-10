"use client";

import { useMemo, useState } from "react";
import {
  NATIONAL_SUBCATEGORIES,
  TOUR_CATEGORIES,
  TOUR_CATEGORY_LABELS,
  type TourCategory,
  type TourSubcategory,
} from "@/lib/tour-categories";
import type { ProductCard as ProductCardData } from "@/types/guianatours-com-co-e923d4eb";
import { SubcategoryButton } from "./categorias/SubcategoryButton";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

/**
 * "Próximas aventuras" browser.
 *
 * - Al abrir: sin filtro — se ven TODAS las salidas.
 * - Nacionales / Internacionales y las subcategorías comparten el mismo botón
 *   (`.tm-cat-chip`: contorno fino, sigue la paleta; `.is-active` = relleno).
 *   Volver a pulsar el activo quita el filtro.
 * - Solo Nacionales despliega las tres subcategorías (Ríos → Pueblos vivos →
 *   Volcanes); en esas, además, el rótulo lleva la animación (ver
 *   <SubcategoryButton>).
 *
 * Se usa en la portada y en /proximas-salidas.
 */
export function AdventureBrowser({ tours }: { tours: ProductCardData[] }) {
  const [category, setCategory] = useState<TourCategory | null>(null);
  const [subcategory, setSubcategory] = useState<TourSubcategory | null>(null);

  function pickCategory(next: TourCategory) {
    setCategory((current) => (current === next ? null : next));
    setSubcategory(null);
  }

  function pickSubcategory(next: TourSubcategory) {
    setSubcategory((current) => (current === next ? null : next));
  }

  const visible = useMemo(
    () =>
      tours.filter(
        (tour) =>
          (!category || tour.category === category) &&
          (!subcategory || tour.subcategory === subcategory),
      ),
    [tours, category, subcategory],
  );

  return (
    <div className="flex flex-col">
      <div className="tm-cat-row flex flex-wrap items-center justify-center gap-2.5">
        {TOUR_CATEGORIES.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => pickCategory(id)}
            className={`tm-cat-chip${category === id ? " is-active" : ""}`}
          >
            <span className="tm-cat-chip__label">{TOUR_CATEGORY_LABELS[id]}</span>
          </button>
        ))}
      </div>

      {category === "nacional" ? (
        <div className="tm-sub-row mt-3 flex flex-wrap items-center justify-center gap-2.5">
          {NATIONAL_SUBCATEGORIES.map((s) => (
            <SubcategoryButton
              key={s.id}
              subcategory={s.id}
              label={s.label}
              active={subcategory === s.id}
              onSelect={() => pickSubcategory(s.id)}
            />
          ))}
        </div>
      ) : null}

      {visible.length ? (
        <ul className="mt-8 mb-[17px] grid list-none grid-cols-1 gap-10 p-0 min-[576px]:grid-cols-2 min-[1025px]:grid-cols-3">
          {visible.map((product, index) => (
            <Reveal key={product.id} as="li" zoom delay={(index % 3) * 90}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl bg-white p-8 text-center text-[var(--gn-palette-5)]">
          Pronto publicaremos aventuras en esta categoría.
        </p>
      )}
    </div>
  );
}
