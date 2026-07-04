import { getManifest } from "@/lib/store";

export const revalidate = 0;

export async function GET(_request, { params }) {
  const manifest = await getManifest();
  const doc = manifest.docs.find((d) => d.slug === params.slug);
  if (!doc) {
    return new Response("Document introuvable", { status: 404 });
  }
  const res = await fetch(doc.blobUrl, { cache: "no-store" });
  if (!res.ok) {
    return new Response("Erreur de lecture du document", { status: 502 });
  }
  const html = await res.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
