"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GalleryHorizontalEnd,
  House,
  Images,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Kept here (not in the server layout) so the icon components never have to
// cross the server→client boundary as props — see the "plain objects only"
// RSC rule.
const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Ajustes del sitio", icon: Settings },
  { href: "/admin/nav", label: "Menú del sitio", icon: Link2 },
  { href: "/admin/hero", label: "Portada", icon: Images },
  { href: "/admin/tours", label: "Aventuras y salidas", icon: CalendarDays },
  { href: "/admin/sections", label: "Secciones", icon: BookOpen },
  { href: "/admin/gallery", label: "Galería", icon: GalleryHorizontalEnd },
  { href: "/admin/reviews", label: "Testimonios", icon: MessageSquareText },
  { href: "/admin/bookings", label: "Reservas", icon: House },
  { href: "/admin/users", label: "Usuarios", icon: Users },
];

const WORKER_NAV: NavItem[] = [{ href: "/admin/bookings", label: "Reservas", icon: House }];

/**
 * Admin navigation. Desktop (lg+) is a static sticky sidebar; on smaller
 * screens it collapses to a top bar with a slide-in drawer instead of the
 * old horizontally-scrolling strip of nine links.
 */
export function AdminShellNav({ role, email }: { role: "admin" | "worker"; email: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = role === "admin" ? ADMIN_NAV : WORKER_NAV;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-white/15 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-40 flex h-[60px] items-center gap-3 border-b border-white/10 bg-[var(--gn-palette-2)] px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Image src="/brand/lobos/logo-white-640.png" alt="" width={640} height={640} className="h-8 w-8 object-contain" />
        <p className="min-w-0 truncate text-sm font-extrabold tracking-[.08em]">CLUB DE LOBOS</p>
        <form action={logout} className="ml-auto">
          <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </header>

      {/* ---------- Mobile drawer ---------- */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-[2px] duration-200 animate-in fade-in"
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-[var(--gn-palette-2)] text-white shadow-2xl duration-200 animate-in slide-in-from-left">
            <div className="flex h-[60px] items-center gap-3 border-b border-white/10 px-4">
              <Image src="/brand/lobos/logo-white-640.png" alt="" width={640} height={640} className="h-8 w-8 object-contain" />
              <p className="min-w-0 flex-1 truncate text-sm font-extrabold tracking-[.08em]">CLUB DE LOBOS</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{links}</div>
            <div className="border-t border-white/10 p-3">
              <p className="mb-2 truncate px-2 text-[11px] text-white/50">{email}</p>
              <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------- Desktop sidebar ---------- */}
      <aside className="z-40 hidden bg-[var(--gn-palette-2)] text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <Image src="/brand/lobos/logo-white-640.png" alt="" width={640} height={640} className="h-11 w-11 object-contain" />
          <p className="min-w-0 text-sm font-extrabold tracking-[.08em]">CLUB DE LOBOS</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">{links}</div>
        <div className="border-t border-white/10 p-4">
          <p className="mb-3 truncate px-2 text-[11px] text-white/50">{email}</p>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
