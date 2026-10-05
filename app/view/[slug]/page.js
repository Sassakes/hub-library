import Link from "next/link";
import { notFound } from "next/navigation";
import { getManifestCached } from "@/lib/store";
import { getLang, dict } from "@/lib/i18n";
import { docTitle } from "@/lib/taxonomy";

export const revalidate = 0;

export default async function ViewPage({ params }) {
  const lang = getLang();
  const t = dict[lang];
  const manifest = await getManifestCached();
  const doc = manifest.docs.find((d) => d.slug === params.slug);
  if (!doc) notFound();

  return (
    <div className="viewer">
      <div className="viewer-bar">
        <Link href="/" className="back">
          {t.backToLibrary}
        </Link>
        <span className="doc-title">{docTitle(doc, lang)}</span>
        {doc.indicator?.enabled && doc.indicator?.url && (
          <a href={doc.indicator.url} target="_blank" rel="noreferrer" className="ind-cta">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
            {t.indicatorCta}
          </a>
        )}
      </div>
      <iframe src={`/api/raw/${doc.slug}`} title={docTitle(doc, lang)} sandbox="allow-scripts allow-same-origin" />
    </div>
  );
}
