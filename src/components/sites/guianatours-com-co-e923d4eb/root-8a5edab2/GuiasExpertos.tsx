import Image from "next/image";
import type { GuiasBlock } from "@/lib/queries/site-content";

/**
 * Section 56e43f8 — heading + CTA on the left, two photographs filling the rest.
 *
 * The three Elementor columns are NOT equal thirds: they measure 379.98 /
 * 374.97 / 381.20 of the 1140px container. Those exact widths are what make the
 * two photos (439×373 and 446×373) land on the same rendered height (318.6 and
 * 318.8), so they are reproduced verbatim rather than normalised to 1/3 each.
 *
 * Below 768px that layout is dropped entirely for a mobile-only design: a
 * centred intro over a stack of rounded photo cards with real spacing, so the
 * images read as distinct instead of a cramped edge-to-edge strip.
 */
const COLUMN_BASIS = ["33.332%", "32.892%", "33.439%"] as const;

export function GuiasExpertos({ block }: { block: GuiasBlock }) {
  return (
    <section id="nosotros" className="relative px-5 pt-[60px] max-[767px]:pt-12">
      {/* ---------- desktop (>=768px) ---------- */}
      <div className="mx-auto hidden max-w-[1140px] min-[768px]:flex min-[768px]:flex-row">
        {/* text column — vertically centred against the photos */}
        <div className="flex w-full min-[768px]:w-auto" style={{ flexBasis: COLUMN_BASIS[0] }}>
          <div className="gn-widget-wrap mb-[50px] flex w-full items-center">
            <div className="flex flex-col items-start">
              <div className="mb-5">
                <h2 className="mb-3 text-2xl leading-6 font-bold text-[var(--gn-palette-3)]">{block.heading}</h2>
              </div>
              <a href={block.buttonHref} className="gn-button">
                {block.buttonLabel}
              </a>
            </div>
          </div>
        </div>

        {block.images.map((image, i) => (
          <div
            key={image.src}
            className="flex w-full min-[768px]:w-auto"
            style={{ flexBasis: COLUMN_BASIS[i + 1] }}
          >
            <Image
              src={image.src}
              alt={block.heading}
              width={image.width}
              height={image.height}
              className="block h-auto w-full"
              sizes="33vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* ---------- mobile (<768px) ---------- */}
      <div className="mx-auto max-w-[460px] min-[768px]:hidden">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[26px] font-bold leading-[1.2] text-[var(--gn-palette-3)]">{block.heading}</h2>
          <a href={block.buttonHref} className="gn-button mt-5">
            {block.buttonLabel}
          </a>
        </div>

        <div className="mt-7 flex flex-col gap-4">
          {block.images.map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-2xl shadow-[0_14px_36px_-16px_rgba(0,0,0,0.4)]"
            >
              <Image
                src={image.src}
                alt={block.heading}
                width={image.width}
                height={image.height}
                className="block aspect-[5/4] w-full object-cover"
                sizes="100vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
