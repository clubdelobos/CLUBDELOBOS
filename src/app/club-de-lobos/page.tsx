import type { Metadata } from "next";
import Image from "next/image";
import { PublicPageShell } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/PublicPageShell";
import { getContentBlocks, getGalleryItems } from "@/lib/queries/site-content";
import { pageMetadata } from "@/lib/seo/metadata";
import { ORGANIZATION_ID, buildBreadcrumbJsonLd, jsonLdString } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Club de Lobos: quiénes somos | Tour operadora en El Salvador",
  absoluteTitle: true,
  description: "Conoce a Club de Lobos, la manada salvadoreña de guías y amigos que organiza senderismo, camping y viajes para descubrir El Salvador y el mundo.",
  path: "/club-de-lobos",
});

export default async function ClubDeLobosPage() {
  const [blocks, gallery] = await Promise.all([getContentBlocks(), getGalleryItems()]);
  const blockImages = blocks.guias.images.map((image) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: "Aventura de Club de Lobos",
  }));
  const galleryImages = gallery.slice(0, 4).map((image) => ({
    src: image.full,
    width: image.width,
    height: image.height,
    alt: image.title || "Experiencia de Club de Lobos",
  }));
  const images = [...blockImages, ...galleryImages];
  const bannerImage = images[0]?.src ?? blocks.camping.image?.src ?? null;

  return (
    <PublicPageShell currentPath="/club-de-lobos" title="Club de Lobos" bannerImage={bannerImage}>
      <main className="px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[1140px]">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] lg:gap-16">
            <article className="space-y-6 text-[17px] leading-8 text-[var(--gn-palette-5)]">
              <h2 className="text-2xl font-extrabold leading-tight text-[var(--gn-palette-3)]">Aventuras que nos conectan</h2>
              <p>
                Club de Lobos es una comunidad salvadoreña de amigos que disfruta descubrir caminos, montañas y rincones naturales por medio del senderismo, los viajes y el camping.
              </p>
              <p>
                Organizamos experiencias para compartir en manada, conocer nuestro país y crear recuerdos con personas que valoran la naturaleza, el compañerismo y la aventura. Antes de cada salida comunicamos la ruta, el punto de encuentro y las recomendaciones necesarias para que cada participante llegue preparado.
              </p>
              <p>
                Nuestro propósito es vivir cada destino con respeto: cuidamos el entorno, seguimos las indicaciones de quienes coordinan la ruta y promovemos una convivencia responsable entre todos los integrantes del grupo.
              </p>
              <a
                href="https://www.instagram.com/lobos_sv/"
                target="_blank"
                rel="noopener noreferrer"
                className="gn-button mt-2"
              >
                Conoce a la manada en Instagram
              </a>
            </article>

            <aside className="rounded-2xl bg-[var(--gn-palette-8)] p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-[var(--gn-palette-3)]">Nuestra forma de viajar</h2>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[var(--gn-palette-5)]">
                <li><strong className="text-[var(--gn-palette-1)]">Comunidad:</strong> compartimos el camino y cuidamos el ritmo de la manada.</li>
                <li><strong className="text-[var(--gn-palette-1)]">Naturaleza:</strong> disfrutamos los destinos de El Salvador con responsabilidad.</li>
                <li><strong className="text-[var(--gn-palette-1)]">Aventura:</strong> cada salida es una oportunidad de conocer algo nuevo.</li>
                <li><strong className="text-[var(--gn-palette-1)]">Respeto:</strong> seguimos la logística y las medidas de seguridad de cada ruta.</li>
              </ul>
            </aside>
          </div>

          {images.length ? (
            <section className="mt-14 sm:mt-20" aria-labelledby="club-gallery-title">
              <h2 id="club-gallery-title" className="mb-6 text-center text-2xl font-extrabold text-[var(--gn-palette-3)]">Así vive la manada</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {images.slice(0, 4).map((image, index) => (
                  <div key={`${image.src}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--gn-palette-8)]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 767px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Club de Lobos: quiénes somos",
          url: `${SITE_URL}/club-de-lobos`,
          inLanguage: "es-SV",
          about: { "@id": ORGANIZATION_ID },
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(buildBreadcrumbJsonLd([
          { name: "Inicio", url: SITE_URL },
          { name: "Quiénes somos", url: `${SITE_URL}/club-de-lobos` },
        ])) }}
      />
    </PublicPageShell>
  );
}
