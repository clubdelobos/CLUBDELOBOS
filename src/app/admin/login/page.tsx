import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGalleryItems, getSiteSettings } from "@/lib/queries/site-content";
import { LoginBackdrop } from "./LoginBackdrop";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, settings, gallery] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getGalleryItems(),
  ]);
  const shots = gallery.map((g) => ({ full: g.full, width: g.width, height: g.height }));

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--gn-palette-2)] px-4"
      style={{
        "--gn-palette-1": settings.palette[1],
        "--gn-palette-2": settings.palette[2],
        "--gn-palette-3": settings.palette[3],
        "--gn-palette-5": settings.palette[5],
        "--gn-palette-7": settings.palette[7],
        "--gn-palette-8": settings.palette[8],
      } as React.CSSProperties}
    >
      <LoginBackdrop shots={shots} />

      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al sitio
      </Link>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white/95 p-8 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md duration-500 animate-in fade-in slide-in-from-bottom-4">
        <Image src="/brand/lobos/logo-black-640.png" alt="Club de Lobos" width={640} height={640} priority className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-[var(--gn-palette-3)]">Club de Lobos</h1>
          <p className="mt-1 text-sm text-[var(--gn-palette-5)]">Panel de administración</p>
        </div>
        <LoginForm next={next} />
        <p className="text-center text-[11px] leading-4 text-[var(--gn-palette-5)]">
          Acceso exclusivo para el equipo. Si perdiste tu contraseña, contacta al administrador del sitio.
        </p>
      </div>
    </div>
  );
}
