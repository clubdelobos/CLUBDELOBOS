"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Wrapper element — defaults to a plain <div>. */
  as?: ElementType;
  className?: string;
  /** Stagger, in ms, applied as a CSS transition-delay. */
  delay?: number;
  /** Add a slight scale-up to the rise (used for cards / media). */
  zoom?: boolean;
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  style?: React.CSSProperties;
}

/**
 * Reveals its children once, as they scroll into view — the fade-and-rise
 * entrance the reference site (guianatours.com.co) uses on every section.
 *
 * It observes a single element, unobserves itself the first time it
 * intersects, and never hides again: no looping, no re-trigger on scroll
 * back up. If IntersectionObserver is unavailable, or the visitor prefers
 * reduced motion, the content renders visible immediately.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  zoom = false,
  threshold = 0.15,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-revealed={revealed ? "true" : "false"}
      className={`gn-reveal${zoom ? " gn-reveal-zoom" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, "--gn-reveal-delay": `${delay}ms` } as React.CSSProperties : style}
    >
      {children}
    </Tag>
  );
}
