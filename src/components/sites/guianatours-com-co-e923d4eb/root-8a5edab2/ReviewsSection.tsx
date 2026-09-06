"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@/components/sites/guianatours-com-co-e923d4eb/shared/icons";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";
import type { Review } from "@/types/guianatours-com-co-e923d4eb";

/** Trustindex `data-pager-autoplay-timeout="6"`. */
const AUTOPLAY_MS = 6000;
const CLAMP_AT = 160;

function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-px", className)} aria-label={`${count} de 5`}>
      {Array.from({ length: count }, (_, i) => (
        <StarIcon key={i} className="h-[17px] w-[17px] text-[var(--gn-palette-7)]" />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > CLAMP_AT;

  return (
    <article className="flex w-full flex-col rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <header className="mb-2 flex items-start gap-2">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] text-sm font-bold text-[#4285f4]"
        >
          G
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] leading-[20px] font-semibold text-[var(--gn-palette-3)]">
            {review.author}
          </p>
          <time dateTime={review.isoDate} className="text-[12px] leading-[18px] text-[var(--gn-palette-5)]">
            {review.relativeDate}
          </time>
        </div>
      </header>
      <Stars count={review.rating} className="mb-2" />
      <p className="text-[14px] leading-[20px] text-[var(--gn-palette-5)]">
        {isLong && !expanded ? `${review.text.slice(0, CLAMP_AT).trimEnd()}…` : review.text}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 self-start text-[13px] leading-[18px] font-medium text-[var(--gn-palette-1)] underline"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      ) : null}
    </article>
  );
}

/**
 * Section f59f585 — the Trustindex Google-reviews slider.
 * The original injects this from cdn.trustindex.io; the clone renders the same
 * output from the six reviews captured off the live DOM. See ARTIFACT_MANIFEST.md.
 */
export interface ReviewsSectionProps {
  reviews: Review[];
  summary: { rating: string; countLabel: string; stars: number };
}

export function ReviewsSection({ reviews, summary }: ReviewsSectionProps) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(reviews.length / 4);

  useEffect(() => {
    // Guard against an admin deleting every review — pages === 0 would divide
    // by zero and spin the interval on a NaN page forever.
    if (pages === 0) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pages), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [pages]);

  if (reviews.length === 0) return null;

  // Derived, not stored: same reasoning as HeroSlider's safeIndex — wrap a
  // stale page back in bounds at render time instead of a setState-in-effect.
  const safePage = page % pages;

  return (
    <section className="mt-10 px-5">
      <Reveal className="mx-auto max-w-[1140px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* rating header */}
          <div className="flex shrink-0 flex-col items-center lg:w-[200px] lg:items-start">
            <strong className="text-[22px] leading-[28px] font-bold text-[var(--gn-palette-3)]">
              {summary.rating}
            </strong>
            <Stars count={summary.stars} className="my-1" />
            <span className="text-[13px] leading-[20px] text-[var(--gn-palette-5)]">
              {summary.countLabel}
            </span>
          </div>

          {/* slider viewport */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {Array.from({ length: pages }, (_, p) => (
                <div
                  key={p}
                  className="grid w-full shrink-0 grid-cols-1 gap-4 px-px sm:grid-cols-2 lg:grid-cols-4"
                >
                  {reviews.slice(p * 4, p * 4 + 4).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
