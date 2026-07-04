import Link from "next/link";
import { notFound } from "next/navigation";
import { getManifest } from "@/lib/store";

export const revalidate = 0;

export default async function ViewPage({ params }) {
  const manifest = await getManifest();
  const doc = manifest.docs.find((d) => d.slug === params.slug);
  if (!doc) notFound();

  return (
    <div className="viewer">
      <div className="viewer-bar">
        <Link href="/" className="back">
          ← library
        </Link>
        <span className="doc-title">{doc.title}</span>
      </div>
      <iframe src={`/api/raw/${doc.slug}`} title={doc.title} sandbox="allow-scripts allow-same-origin" />
    </div>
  );
}
