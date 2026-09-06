import Image from "next/image";
import type { FotografiasBlock } from "@/lib/queries/site-content";
import type { GalleryItem } from "@/types/guianatours-com-co-e923d4eb";

/**
 * Sections 60df0cd + 48229f1 — the "Fotografías de la semana" heading and the
 * portada gallery below it. Two presentations, chosen in the admin:
 *
 * - "grid" (default): the Elementor justified-row layout, reproduced with the
 *   flexbox technique — each item grows in proportion to its aspect ratio so
 *   rows fill the width at ~300px (150px on mobile) without the e-gallery script.
 * - "marquee": an edge-to-edge strip that auto-scrolls, seamless and subtle
 *   (nice on mobile). See GalleryMarquee.
 */
function GalleryTile({
  item,
  className = "",
  style,
  contain = false,
}: {
  item: GalleryItem;
  className?: string;
  style?: React.CSSProperties;
  /** true → image keeps its aspect ratio (marquee); false → fills the box (grid). */
  contain?: boolean;
}) {
  return (
    <a
      href={item.full}
      target="_blank"
      rel="noopener noreferrer"
      title={item.title}
      style={style}
      className={`group relative block overflow-hidden rounded-xl transition-transform duration-300 ease-out hover:-translate-y-0.5 ${className}`}
    >
      <Image
        src={item.thumb}
        alt={item.title}
        width={item.width}
        height={item.height}
        className={`${contain ? "h-full w-auto" : "h-full w-full"} object-cover transition-transform duration-500 ease-out group-hover:scale-105`}
        sizes="(max-width: 1024px) 50vw, 33vw"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </a>
  );
}

/**
 * "Marquesina" — the track holds the row twice; the CSS animation (globals.css,
 * `.gn-marquee-track`) shifts it -50% and repeats, so the loop has no seam.
 * Pauses on hover/focus and freezes under prefers-reduced-motion.
 */
function GalleryMarquee({ gallery }: { gallery: GalleryItem[] }) {
  // Slower with more photos so the on-screen speed stays roughly constant.
  const duration = Math.max(24, gallery.length * 5);
  const row = (dup: boolean) => (
    <ul aria-hidden={dup || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {gallery.map((item) => (
        <li key={`${dup ? "dup-" : ""}${item.id}`} className="shrink-0">
          <GalleryTile item={item} contain className="h-[130px] min-[1025px]:h-[210px]" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className="gn-marquee-viewport relative overflow-hidden py-1"
      style={{ "--gn-marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="gn-marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--gn-palette-8)] to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--gn-palette-8)] to-transparent sm:w-20" />
    </div>
  );
}

export function FotografiasSemana({ block, gallery }: { block: FotografiasBlock; gallery: GalleryItem[] }) {
  return (
    <>
      <section className="px-5 pb-[10px] pt-10">
        <div className="mx-auto max-w-[1140px]">
          <div className="gn-widget-wrap">
            <h2 className="mb-3 text-center text-2xl leading-6 font-bold text-[var(--gn-palette-3)]">
              {block.heading}
            </h2>
            <p className="m-0 text-center text-[17px] leading-[27.2px] font-normal text-[var(--gn-palette-5)]">
              {block.body}
            </p>
          </div>
        </div>
      </section>

      {block.layout === "marquee" && gallery.length > 0 ? (
        <GalleryMarquee gallery={gallery} />
      ) : (
        <section className="px-[10px]">
          <div className="flex flex-wrap gap-3 [--gn-row-h:150px] min-[1025px]:[--gn-row-h:300px]">
            {gallery.map((item) => {
              const ratio = item.width / item.height;
              return (
                <GalleryTile
                  key={item.id}
                  item={item}
                  className="h-[var(--gn-row-h)]"
                  style={{ flexGrow: ratio * 100, flexBasis: `calc(var(--gn-row-h) * ${ratio})` }}
                />
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
