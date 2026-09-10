"use client";

import { useEffect, useRef, useState } from "react";
import type { TourSubcategory } from "@/lib/tour-categories";
import { TourMotion, type TourMotionAnimation } from "./tour-motion.js";

/**
 * Botón de subcategoría (Ríos / Pueblos vivos / Volcanes).
 *
 * En reposo es un botón normal (mismo estilo que Nacionales·Internacionales:
 * `.tm-cat-chip`, texto plano).
 *
 * Solo en ESCRITORIO (punteros con hover), al pasar el puntero / enfocar
 * aparece un <canvas> encima donde la ilustración (cascada / pueblo / volcán)
 * se transforma en la palabra a color; al salir vuelve al texto plano.
 *
 * En pantallas TÁCTILES (celular / tablet) NO hay animación: el motor ni
 * siquiera se inicializa y el botón es una pastilla simple que solo filtra al
 * tocarla.
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
  const [hot, setHot] = useState(false);
  const isTouch =
    typeof window !== "undefined" && !!window.matchMedia?.("(hover: none)").matches;

  useEffect(() => {
    // Sin animación en pantallas táctiles: no se carga el motor.
    if (isTouch) return;
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
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [subcategory, label, isTouch]);

  const showHot = hot && !isTouch;

  useEffect(() => {
    if (showHot) animationRef.current?.play();
    else animationRef.current?.stop();
  }, [showHot]);

  const enter = () => setHot(true);
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
      onClick={onSelect}
      className={`tm-cat-chip${active ? " is-active" : ""}${showHot ? " is-hot" : ""}`}
    >
      <span ref={labelRef} className="tm-cat-chip__label">{label}</span>
      <canvas ref={canvasRef} className="tm-cat-chip__canvas" aria-hidden="true" />
    </button>
  );
}
