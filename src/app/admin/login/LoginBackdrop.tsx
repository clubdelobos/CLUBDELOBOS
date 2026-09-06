import Image from "next/image";

interface Shot {
  full: string;
  width: number;
  height: number;
}

/**
 * Login backdrop: three slow vertical marquee columns of gallery photos,
 * blurred and darkened behind the card. Falls back to a flat wash when there
 * aren't enough photos.
 */
export function LoginBackdrop({ shots }: { shots: Shot[] }) {
  if (shots.length < 3) {
    return <div className="absolute inset-0 bg-[var(--gn-palette-2)]" />;
  }

  const columns = [0, 1, 2].map((c) => shots.filter((_, i) => i % 3 === c));
  const durations = ["58s", "76s", "64s"];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[var(--gn-palette-2)]">
      <div className="absolute inset-0 flex gap-3 opacity-90 blur-[2px] sm:gap-4">
        {columns.map((col, ci) => (
          <div key={ci} className="relative flex-1 overflow-hidden">
            <div
              className={`gn-marquee-col flex flex-col gap-3 sm:gap-4 ${ci === 1 ? "gn-marquee-col--reverse" : ""}`}
              style={{ "--gn-col-duration": durations[ci] } as React.CSSProperties}
            >
              {[...col, ...col, ...col].map((shot, i) => (
                <span key={i} className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl">
                  <Image src={shot.full} alt="" fill sizes="33vw" className="object-cover" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* darkening + palette wash so the card stays readable; heavier toward
          the centre where the form sits */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gn-palette-2)]/45 via-[var(--gn-palette-2)]/35 to-[var(--gn-palette-2)]/65" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gn-palette-2)_78%,transparent)_0%,transparent_60%)]" />
    </div>
  );
}
