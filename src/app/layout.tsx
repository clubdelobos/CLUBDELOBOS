import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { getIconTheme } from "@/lib/queries/site-content";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const BRAND = "/brand/lobos";
const TITLE = "Club de Lobos El Salvador | Senderismo, camping y viajes guiados";
const DESCRIPTION = "Club de Lobos es una tour operadora salvadoreña: senderismo, camping, volcanes y viajes nacionales e internacionales con guías expertos. Reserva tu próxima aventura en manada.";

export async function generateMetadata(): Promise<Metadata> {
  // The favicon / app icons follow the palette selected in Ajustes (Google shows
  // this icon next to the site in search results). Sets: public/brand/lobos/themes/.
  const theme = `${BRAND}/themes/${await getIconTheme()}`;
  const googleToken = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bingToken = process.env.BING_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: `%s | ${SITE_NAME}` },
    description: DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    // Google Search Console "HTML tag" ownership check. Set the token (only the
    // `content` value, not the whole tag) in GOOGLE_SITE_VERIFICATION; unset = no tag.
    // Same for Bing Webmaster Tools (feeds Bing, DuckDuckGo and Yahoo) via BING_SITE_VERIFICATION.
    ...(googleToken || bingToken
      ? {
          verification: {
            ...(googleToken ? { google: googleToken } : {}),
            ...(bingToken ? { other: { "msvalidate.01": bingToken } } : {}),
          },
        }
      : {}),
    icons: {
      icon: [
        { url: `${theme}/favicon-32.png`, sizes: "32x32", type: "image/png" },
        { url: `${theme}/favicon-48.png`, sizes: "48x48", type: "image/png" },
        { url: `${theme}/icon-192.png`, sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: `${theme}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      locale: "es_SV",
      type: "website",
      title: TITLE,
      description: DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [{ url: `${BRAND}/og-image.png`, width: 1200, height: 630, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [`${BRAND}/og-image.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-SV" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
