import Image from "next/image";
import type { CampingBlock } from "@/lib/queries/site-content";

/**
 * Section 11044c1 — a 66/33 split. The photograph's wrapper carries
 * `margin-top: -50px` so it overlaps the section above; that reset to 0 below 768px.
 * At <=1024px the container goes full-bleed.
 *
 * Below 768px the split is dropped for a mobile-only design: one contained,
 * rounded card — photo on top, the palette-coloured copy block beneath it — so
 * the image stays large and clear and the whole thing reads as a single unit
 * instead of a full-bleed photo stacked awkwardly on a colour band.
 */
export function CampingSection({ block }: { block: CampingBlock }) {
  return (
    <section className="relative">
      {/* ---------- desktop (>=768px) ---------- */}
      <div className="mx-auto hidden max-w-[1140px] max-[1024px]:max-w-none min-[768px]:flex min-[768px]:flex-row">
        <div className="flex min-[768px]:w-2/3">
          <div className="-mt-[50px] w-full">
            {block.image ? (
              <Image
                src={block.image.src}
                alt={block.heading}
                width={block.image.width}
                height={block.image.height}
                className="block h-auto w-full"
                sizes="66vw"
              />
            ) : null}
          </div>
        </div>

        <div className="flex min-[768px]:w-1/3">
          <div className="flex w-full items-center bg-[var(--gn-palette-7)] px-5 py-10 transition-[background,border,border-radius,box-shadow] duration-300">
            <div>
              <h2 className="mb-3 text-2xl leading-6 font-bold text-[var(--gn-palette-3)]">{block.heading}</h2>
              <p className="m-0 text-[17px] leading-[27.2px] font-normal text-[var(--gn-palette-5)]">
                {block.body}
              </p>
              <div className="mt-[30px]">
                <a href={block.buttonHref} className="gn-button">
                  {block.buttonLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- mobile (<768px) ---------- */}
      <div className="px-5 py-10 min-[768px]:hidden">
        <div className="mx-auto max-w-[460px] overflow-hidden rounded-3xl shadow-[0_22px_54px_-22px_rgba(0,0,0,0.45)]">
          {block.image ? (
            <Image
              src={block.image.src}
              alt={block.heading}
              width={block.image.width}
              height={block.image.height}
              className="block aspect-[16/11] w-full object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="bg-[var(--gn-palette-7)] px-6 py-7">
            <h2 className="text-[26px] font-bold leading-[1.2] text-[var(--gn-palette-3)]">{block.heading}</h2>
            <p className="mt-3 text-[16px] leading-[26px] text-[var(--gn-palette-5)]">{block.body}</p>
            <a href={block.buttonHref} className="gn-button mt-6">
              {block.buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
