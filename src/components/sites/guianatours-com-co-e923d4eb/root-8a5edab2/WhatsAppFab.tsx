"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WhatsAppGlyph } from "@/components/sites/guianatours-com-co-e923d4eb/shared/WhatsAppGlyph";

interface WhatsAppFabProps {
  /** Public contact phone, e.g. "tel:+50379528033" or a bare number. */
  phoneHref: string;
  /** Prefilled chat text. */
  message?: string;
}

/**
 * Floating WhatsApp contact button, bottom-right on every public page. Themed
 * to the active palette: a soft radial fill, an accent ring, and a face that
 * flips between the wolf mark and the WhatsApp glyph on a short loop. Sits
 * below the booking dialog (z-[1000]).
 */
export function WhatsAppFab({
  phoneHref,
  message = "Hola, me gustaría más información sobre las próximas salidas de Club de Lobos.",
}: WhatsAppFabProps) {
  const [shown, setShown] = useState(false);
  const number = phoneHref.replace(/\D/g, "");

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 150);
    return () => clearTimeout(id);
  }, []);

  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={`group fixed bottom-5 right-4 z-[90] block h-14 w-14 rounded-full p-[2px] shadow-[0_14px_34px_-6px_rgba(0,0,0,0.45)] transition-[transform,opacity,box-shadow] duration-300 ease-out hover:scale-[1.07] hover:shadow-[0_18px_42px_-6px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gn-palette-7)] sm:bottom-6 sm:right-6 sm:h-[60px] sm:w-[60px] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{
        background: "linear-gradient(140deg, var(--gn-palette-7), color-mix(in srgb, var(--gn-palette-7) 40%, var(--gn-palette-1)))",
      }}
    >
      <span
        className="relative flex h-full w-full items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(120% 120% at 30% 25%, color-mix(in srgb, var(--gn-palette-1) 88%, white), var(--gn-palette-2))",
        }}
      >
        <span className="gn-fab-flip relative h-8 w-8 sm:h-9 sm:w-9">
          {/* front — the wolf mark (resting face) */}
          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
            <Image
              src="/brand/lobos/logo-white-640.png"
              alt=""
              width={72}
              height={72}
              className="h-full w-full scale-[1.35] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            />
          </span>
          {/* back — WhatsApp glyph in the accent colour */}
          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <WhatsAppGlyph className="h-full w-full text-[var(--gn-palette-7)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
          </span>
        </span>
      </span>
    </a>
  );
}
