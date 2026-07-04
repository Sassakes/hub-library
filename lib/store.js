import { put, del, list } from "@vercel/blob";

const MANIFEST_PATH = "library/manifest.json";

const EMPTY_MANIFEST = {
  categories: [], // { id, name, order }
  docs: [], // { slug, title, categoryId|null, order, blobUrl, blobPath, size, createdAt }
};

export async function getManifest() {
  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 1 });
  const blob = blobs.find((b) => b.pathname === MANIFEST_PATH);
  if (!blob) return structuredClone(EMPTY_MANIFEST);
  const res = await fetch(`${blob.url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return structuredClone(EMPTY_MANIFEST);
  try {
    const data = await res.json();
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      docs: Array.isArray(data.docs) ? data.docs : [],
    };
  } catch {
    return structuredClone(EMPTY_MANIFEST);
  }
}

export async function saveManifest(manifest) {
  await put(MANIFEST_PATH, JSON.stringify(manifest), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function saveHtmlFile(slug, content) {
  const path = `library/docs/${slug}.html`;
  const blob = await put(path, content, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: true,
  });
  return { blobUrl: blob.url, blobPath: blob.pathname };
}

export async function deleteHtmlFile(blobUrl) {
  try {
    await del(blobUrl);
  } catch {
    // déjà supprimé — on ignore
  }
}

export function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\.html?$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "doc"
  );
}
