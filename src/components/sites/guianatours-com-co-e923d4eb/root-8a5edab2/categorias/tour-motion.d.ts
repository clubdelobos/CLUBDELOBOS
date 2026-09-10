/** Types for the vendored `tour-motion.js` engine. */

export interface TourMotionAnimation {
  play(): void;
  stop(): void;
  seek(seconds: number): void;
  destroy(): void;
}

export interface TourMotionPaletteEntry {
  label: string;
  color: string;
  bg: string;
  detail: string;
  colors: string[];
}

export interface TourMotionApi {
  Animation: new (
    canvas: HTMLCanvasElement,
    key: string,
    options?: {
      label?: string;
      autoplay?: boolean;
      particles?: number;
      /** false = no underline/flower/wave beneath the final word. */
      flourish?: boolean;
      /** playback speed multiplier (default 1). */
      speed?: number;
      onComplete?: () => void;
    },
  ) => TourMotionAnimation;
  palette: Record<string, TourMotionPaletteEntry>;
  duration: number;
  width: number;
  height: number;
  /** Render the final word in a custom typeface. Call before constructing
   *  any Renderer/Animation (the text is sampled once). */
  setFont: (family?: string, weight?: number | string) => void;
}

export const TourMotion: TourMotionApi | undefined;
