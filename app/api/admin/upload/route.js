import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { getManifest, saveManifest, saveHtmlFile, slugify } from "@/lib/store";

export const maxDuration = 60;

const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo par fichier

export async function POST(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files");
  const categoryId = formData.get("categoryId") || null;

  if (!files.length) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const manifest = await getManifest();
  const added = [];

  for (const file of files) {
    if (typeof file === "string") continue;
    if (!/\.html?$/i.test(file.name)) continue;
    if (file.size > MAX_SIZE) continue;

    const content = await file.text();
    let slug = slugify(file.name);
    // Unicité du slug
    let base = slug;
    let i = 2;
    while (manifest.docs.some((d) => d.slug === slug)) {
      slug = `${base}-${i++}`;
    }

    const { blobUrl, blobPath } = await saveHtmlFile(slug, content);
    const siblings = manifest.docs.filter((d) => (d.categoryId || null) === categoryId);
    const doc = {
      slug,
      title: base.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      categoryId: categoryId || null,
      order: siblings.length,
      blobUrl,
      blobPath,
      size: file.size,
      createdAt: Date.now(),
      indicator: { enabled: false, url: "" },
    };
    manifest.docs.push(doc);
    added.push(doc);
  }

  if (!added.length) {
    return NextResponse.json(
      { error: "Aucun fichier valide (.html, max 8 Mo)" },
      { status: 400 }
    );
  }

  await saveManifest(manifest);
  return NextResponse.json({ ok: true, added, manifest });
}
