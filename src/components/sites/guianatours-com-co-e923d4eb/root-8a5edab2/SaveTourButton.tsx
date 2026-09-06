"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalidasCart } from "./salidas-cart";

interface SaveTourButtonProps {
  slug: string;
  title: string;
  price?: string;
  image?: string;
  /** "card" floats over a product image; "panel" is a full-width row button. */
  variant?: "card" | "panel";
}

export function SaveTourButton({ slug, title, price, image, variant = "card" }: SaveTourButtonProps) {
  const { has, toggle } = useSalidasCart();
  const saved = has(slug);
  const entry = { slug, title, price, image };

  if (variant === "panel") {
    return (
      <button
        type="button"
        onClick={() => toggle(entry)}
        aria-pressed={saved}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
          saved
            ? "border-[var(--gn-palette-1)] bg-[var(--gn-palette-8)] text-[var(--gn-palette-1)]"
            : "border-[#d9ded9] text-[var(--gn-palette-3)] hover:border-[var(--gn-palette-1)]",
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        {saved ? "Guardada en mi lista" : "Guardar en mi lista"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(entry)}
      aria-pressed={saved}
      aria-label={saved ? `Quitar ${title} de mi lista` : `Guardar ${title} en mi lista`}
      className={cn(
        "absolute right-2 top-2 z-[2] flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-110",
        saved ? "bg-white text-[var(--gn-palette-1)]" : "bg-black/35 text-white hover:bg-black/55",
      )}
    >
      <Heart className={cn("h-[18px] w-[18px]", saved && "fill-current")} />
    </button>
  );
}
