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
 * Floating WhatsApp contact button, bottom-right on every public page. A clean
 * palette-coloured disc — no ring — whose face spins like a coin between the
 * wolf mark and the WhatsApp glyph.
 */
export function WhatsAppFab({
  phoneHref,
  message = "Hola, me gustaría más información sobre las próximas salidas de Club de Lobos.",
}: WhatsAppFabProps) {
  const [shown, setShown] = useState(false);
  const number = phoneHref.replace(/\D/g, "");

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 120);
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
      className={`group fixed bottom-5 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gn-palette-1)] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-300 ease-out hover:scale-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gn-palette-7)] sm:bottom-6 sm:right-6 sm:h-[58px] sm:w-[58px] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span className="gn-fab-coin relative h-8 w-8 sm:h-9 sm:w-9">
        {/* front — the wolf mark */}
        <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
          <Image
            src="/brand/lobos/logo-white-640.png"
            alt=""
            width={72}
            height={72}
            className="h-full w-full scale-[1.4] object-contain"
          />
        </span>
        {/* back — WhatsApp glyph */}
        <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <WhatsAppGlyph className="h-full w-full text-[var(--gn-palette-7)]" />
        </span>
      </span>
    </a>
  );
}
