"use client";

import { useEffect, useRef, useState } from "react";
import type { TourSubcategory } from "@/lib/tour-categories";
import { TourMotion, type TourMotionAnimation } from "./tour-motion.js";

/**
 * Botón de subcategoría (Ríos / Pueblos vivos / Volcanes).
 *
 * En reposo es un botón normal (mismo estilo que Nacionales·Internacionales:
 * `.tm-cat-chip`, texto plano). En escritorio, al pasar el puntero / enfocar
 * aparece un <canvas> encima donde la ilustración (cascada / pueblo / volcán)
 * se transforma en la palabra a color; al salir vuelve al texto plano.
 * En pantallas táctiles el motor no se monta y el botón es solo texto
 * (la animación no se lee bien en un botón angosto) — ver `@media (hover:none)`
 * en globals.css.
 *
 * Motor: `tour-motion.js` (vendido). Se le pasa la tipografía del sitio
 * (Montserrat) para que el rótulo animado sea igual al de los demás botones,
 * `speed` para que sea más ágil y `flourish:false` para terminar solo en el
 * texto.
 */
export function SubcategoryButton({
  subcategory,
  label,
  active,
  onSelect,
}: {
  subcategory: TourSubcategory;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<TourMotionAnimation | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    // Touch devices: no hover, and the animation isn't legible in a narrow
    // pill — skip the engine entirely and leave a plain text button.
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) {
      return;
    }
    let disposed = false;
    const begin = () => {
      if (disposed || !canvasRef.current || !TourMotion) return;
      // Rótulo animado con la misma tipografía que el resto del sitio.
      const family = labelRef.current
        ? getComputedStyle(labelRef.current).fontFamily
        : "";
      TourMotion.setFont(family || undefined, 700);
      animationRef.current = new TourMotion.Animation(canvasRef.current, subcategory, {
        label,
        autoplay: false,
        flourish: false,
        speed: 1.7,
      });
    };
    const ready =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();
    ready.then(begin, begin);
    return () => {
      disposed = true;
      if (touchTimer.current) clearTimeout(touchTimer.current);
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [subcategory, label]);

  useEffect(() => {
    if (hot) animationRef.current?.play();
    else animationRef.current?.stop();
  }, [hot]);

  const enter = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    setHot(true);
  };
  const leave = () => setHot(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar el filtro ${label}` : `Ver aventuras de ${label.toLowerCase()}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") enter();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") leave();
      }}
      onFocus={enter}
      onBlur={leave}
      onClick={() => {
        onSelect();
        // Sin puntero (móvil): reproduce una vez y vuelve al texto plano.
        setHot(true);
        if (touchTimer.current) clearTimeout(touchTimer.current);
        touchTimer.current = setTimeout(() => setHot(false), 2600);
      }}
      className={`tm-cat-chip${active ? " is-active" : ""}${hot ? " is-hot" : ""}`}
    >
      <span ref={labelRef} className="tm-cat-chip__label">{label}</span>
      <canvas ref={canvasRef} className="tm-cat-chip__canvas" aria-hidden="true" />
    </button>
  );
}
