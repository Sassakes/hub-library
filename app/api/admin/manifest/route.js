import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { getManifest, saveManifest, sanitizeLinks, sanitizeIndicator } from "@/lib/store";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const manifest = await getManifest();
  return NextResponse.json(manifest);
}

export async function PUT(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const incoming = await request.json().catch(() => null);
  if (!incoming || !Array.isArray(incoming.categories) || !Array.isArray(incoming.docs)) {
    return NextResponse.json({ error: "Manifest invalide" }, { status: 400 });
  }

  // On ne laisse pas le client toucher aux URLs blob : on repart du manifest serveur
  const current = await getManifest();
  const bySlug = new Map(current.docs.map((d) => [d.slug, d]));

  const docs = incoming.docs
    .filter((d) => bySlug.has(d.slug))
    .map((d) => {
      const server = bySlug.get(d.slug);
      return {
        ...server,
        title: typeof d.title === "string" && d.title.trim() ? d.title.trim().slice(0, 120) : server.title,
        categoryId: d.categoryId || null,
        order: Number.isFinite(d.order) ? d.order : server.order,
        indicator: sanitizeIndicator(d.indicator ?? server.indicator),
      };
    });

  const categories = incoming.categories
    .filter((c) => c && typeof c.id === "string" && typeof c.name === "string" && c.name.trim())
    .map((c, i) => ({
      id: c.id.slice(0, 40),
      name: c.name.trim().slice(0, 60),
      order: Number.isFinite(c.order) ? c.order : i,
    }));

  const catIds = new Set(categories.map((c) => c.id));
  for (const d of docs) {
    if (d.categoryId && !catIds.has(d.categoryId)) d.categoryId = null;
  }

  const links = sanitizeLinks(incoming.links || current.links);

  const manifest = { categories, docs, links };
  await saveManifest(manifest);
  return NextResponse.json({ ok: true, manifest });
}
