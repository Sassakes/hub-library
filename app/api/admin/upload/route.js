import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { getManifest, saveManifest, saveHtmlFile, deleteHtmlFile, slugify } from "@/lib/store";

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

  // Mode "replace" : met à jour le CONTENU d'un document existant, retrouvé
  // par son slug (= nom du fichier). Slug, titre, catégorie, ordre, date et
  // lien d'indicateur restent intacts — c'est ce qui permet de republier un
  // module corrigé ou traduit sans le dupliquer en "slug-2" ni le faire
  // retomber en fin de catégorie. Un fichier sans document correspondant est
  // REFUSÉ dans ce mode : il ne peut jamais créer de doublon.
  if (formData.get("mode") === "replace") {
    const replaced = [];
    const unmatched = [];
    const oldBlobs = [];
    for (const file of files) {
      if (typeof file === "string") continue;
      if (!/\.html?$/i.test(file.name) || file.size > MAX_SIZE) {
        unmatched.push(file.name);
        continue;
      }
      const slug = slugify(file.name);
      const doc = manifest.docs.find((d) => d.slug === slug);
      if (!doc) {
        unmatched.push(file.name);
        continue;
      }
      const { blobUrl, blobPath } = await saveHtmlFile(slug, await file.text());
      oldBlobs.push(doc.blobUrl);
      doc.blobUrl = blobUrl;
      doc.blobPath = blobPath;
      doc.size = file.size;
      doc.updatedAt = Date.now();
      replaced.push(slug);
    }
    if (!replaced.length) {
      return NextResponse.json(
        { error: `Aucun document existant ne correspond : ${unmatched.join(", ") || "—"}`, unmatched },
        { status: 400 }
      );
    }
    await saveManifest(manifest);
    // Anciens fichiers supprimés seulement APRÈS l'enregistrement du manifest :
    // en cas d'échec plus haut, le document pointe toujours vers un blob valide.
    for (const url of oldBlobs) if (url) await deleteHtmlFile(url);
    return NextResponse.json({ ok: true, replaced, unmatched, manifest });
  }

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
