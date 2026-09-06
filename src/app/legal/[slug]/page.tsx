import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageShell } from "@/components/sites/guianatours-com-co-e923d4eb/root-8a5edab2/PublicPageShell";
import { LEGAL_DOCS, getLegalDoc } from "@/lib/legal-content";

export const revalidate = 86400;

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return { title: "Documento no encontrado", robots: { index: false, follow: false } };
  return {
    title: doc.title,
    description: doc.intro.slice(0, 155),
    alternates: { canonical: `/legal/${doc.slug}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  return (
    <PublicPageShell currentPath={`/legal/${doc.slug}`} title={doc.title} eyebrow="Club de Lobos · Información legal">
      <main className="px-5 py-10 sm:py-14">
        <div className="mx-auto max-w-[760px]">
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Documentos legales">
            {LEGAL_DOCS.map((entry) => (
              <Link
                key={entry.slug}
                href={`/legal/${entry.slug}`}
                aria-current={entry.slug === doc.slug ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  entry.slug === doc.slug
                    ? "bg-[var(--gn-palette-1)] text-white"
                    : "bg-[var(--gn-palette-8)] text-[var(--gn-palette-5)] hover:text-[var(--gn-palette-3)]"
                }`}
              >
                {entry.short}
              </Link>
            ))}
          </nav>

          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gn-palette-5)]">
            Última actualización: {doc.updated}
          </p>
          <p className="mt-4 text-[17px] leading-7 text-[var(--gn-palette-5)]">{doc.intro}</p>

          <div className="mt-8 space-y-8">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-extrabold text-[var(--gn-palette-3)]">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="mt-3 text-[15px] leading-7 text-[var(--gn-palette-5)]">{p}</p>
                ))}
                {section.list ? (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[15px] leading-7 text-[var(--gn-palette-5)]">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gn-palette-1)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-10 rounded-xl bg-[var(--gn-palette-8)] p-4 text-xs leading-5 text-[var(--gn-palette-5)]">
            Este documento tiene carácter informativo y está redactado como base adaptada a Club de Lobos. Para su uso
            definitivo se recomienda la revisión de un profesional legal.
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
