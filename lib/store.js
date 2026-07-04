import { put, del, list } from "@vercel/blob";

const MANIFEST_PATH = "library/manifest.json";

export const DEFAULT_LINKS = {
  tradingview: "https://www.tradingview.com/u/datanalyste/#published-scripts",
  x: "https://x.com/mxximex",
  scripts: [
    {
      name: "CVD Divergence Scalper [NQ/ES/RTY]",
      url: "https://www.tradingview.com/script/bLOEVDI7-CVD-Divergence-Scalper-NQ-ES-RTY/",
    },
    {
      name: "EMA Hub - TF Lock",
      url: "https://www.tradingview.com/script/e2ETl4qq-EMA-Hub-TF-Lock/",
    },
    {
      name: "Volumized Fair Value Gaps MTF",
      url: "https://www.tradingview.com/script/6wt6vR7H/",
    },
  ],
  discord: { enabled: false, invite: "" },
};

const EMPTY_MANIFEST = {
  categories: [], // { id, name, order }
  docs: [], // { slug, title, categoryId|null, order, blobUrl, blobPath, size, createdAt }
  links: DEFAULT_LINKS,
};

export function sanitizeLinks(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const str = (v, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return {
    tradingview: str(src.tradingview) || "",
    x: str(src.x) || "",
    scripts: (Array.isArray(src.scripts) ? src.scripts : [])
      .filter((s) => s && typeof s === "object")
      .map((s) => ({ name: str(s.name, 120), url: str(s.url) }))
      .filter((s) => s.name && s.url)
      .slice(0, 20),
    discord: {
      enabled: Boolean(src.discord?.enabled),
      invite: str(src.discord?.invite),
    },
  };
}

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
      links: data.links ? sanitizeLinks(data.links) : structuredClone(DEFAULT_LINKS),
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
