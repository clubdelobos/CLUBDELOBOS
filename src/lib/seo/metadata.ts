import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

/** Default social/share image — same one the root layout ships. */
export const DEFAULT_OG_IMAGE = "/brand/lobos/og-image.png";

const SMALL_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "en", "a", "al", "con", "por", "para", "o", "u"]);

/**
 * Admin-entered tour titles are often typed in ALL CAPS ("TRAVESÍA DE BERLÍN").
 * That reads as shouting in a search-result title, so an all-caps title is
 * converted to Spanish title case ("Travesía de Berlín"). Mixed-case titles are
 * left exactly as the admin wrote them.
 */
export function humanizeTitle(title: string): string {
  const clean = title.trim().replace(/\s+/g, " ");
  const letters = clean.replace(/[^\p{L}]/gu, "");
  if (!letters || letters !== letters.toLocaleUpperCase("es")) return clean;
  return clean
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word, index, words) => {
      // Small words stay lowercase mid-title, but not at the start or right after a dash ("Conchagua - La Union").
      const startsPhrase = index === 0 || /^[-–—]$/.test(words[index - 1]);
      return !startsPhrase && SMALL_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase("es") + word.slice(1);
    })
    .join(" ");
}

/** Collapses whitespace/newlines and cuts at a word boundary so a snippet never ends mid-word. */
export function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** First sentence (or first line) of a longer blurb. */
export function firstSentence(text: string): string {
  const first = text.trim().split(/\n+/)[0] ?? "";
  const match = first.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : first).trim();
}

interface PageMetadataInput {
  /** Page title without the site suffix, unless `absoluteTitle` is set. */
  title: string;
  /** Use the title verbatim — skip the " | Club de Lobos" template suffix. */
  absoluteTitle?: boolean;
  description: string;
  /** Path (or absolute URL) of the canonical page, e.g. "/proximas-salidas". */
  path: string;
  /** Absolute or root-relative image URL for link previews. */
  image?: string;
  imageSize?: { width: number; height: number };
}

/**
 * One place that builds the per-page metadata so every page gets its OWN
 * canonical, Open Graph and Twitter tags. Next replaces (not merges) the
 * layout's `openGraph`/`twitter` objects when a page defines them, and a page
 * that defines none would inherit the homepage's `og:url`/title — both wrong.
 */
export function pageMetadata({ title, absoluteTitle, description, path, image = DEFAULT_OG_IMAGE, imageSize }: PageMetadataInput): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_SV",
      siteName: SITE_NAME,
      title: shareTitle,
      description,
      url: path,
      images: [{ url: image, ...(imageSize ?? (image === DEFAULT_OG_IMAGE ? { width: 1200, height: 630 } : {})) }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [image],
    },
  };
}
