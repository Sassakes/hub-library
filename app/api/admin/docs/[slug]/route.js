import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { getManifest, saveManifest, deleteHtmlFile } from "@/lib/store";

export async function DELETE(_request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const manifest = await getManifest();
  const doc = manifest.docs.find((d) => d.slug === params.slug);
  if (!doc) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  await deleteHtmlFile(doc.blobUrl);
  manifest.docs = manifest.docs.filter((d) => d.slug !== params.slug);
  await saveManifest(manifest);
  return NextResponse.json({ ok: true, manifest });
}
