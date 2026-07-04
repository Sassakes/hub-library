import { put, del, list } from "@vercel/blob";

// Manifest versionné : chaque sauvegarde crée un nouveau fichier (nouvelle URL),
// ce qui contourne le cache CDN ~60s de Vercel Blob sur les URLs écrasées.
const MANIFEST_PREFIX = "library/manifest/";
const LEGACY_MANIFEST_PATH = "library/manifest.json";

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
  categories: [],
  docs: [],
  links: DEFAULT_LINKS,
};

const str = (v, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function sanitizeLinks(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
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

export function sanitizeIndicator(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    enabled: Boolean(src.enabled),
    url: str(src.url),
  };
}

function normalize(data) {
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    docs: (Array.isArray(data.docs) ? data.docs : []).map((d) => ({
      ...d,
      indicator: sanitizeIndicator(d.indicator),
    })),
    links: data.links ? sanitizeLinks(data.links) : structuredClone(DEFAULT_LINKS),
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getManifest() {
  // 1. Version la plus récente (noms horodatés → tri lexical = tri chronologique)
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 100 });
  if (blobs.length > 0) {
    const latest = blobs.reduce((a, b) => (a.pathname > b.pathname ? a : b));
    const data = await fetchJson(latest.url);
    if (data) return normalize(data);
  }
  // 2. Migration : ancien manifest à chemin fixe
  const legacy = await list({ prefix: LEGACY_MANIFEST_PATH, limit: 1 });
  const legacyBlob = legacy.blobs.find((b) => b.pathname === LEGACY_MANIFEST_PATH);
  if (legacyBlob) {
    const data = await fetchJson(`${legacyBlob.url}?t=${Date.now()}`);
    if (data) return normalize(data);
  }
  return structuredClone(EMPTY_MANIFEST);
}

export async function saveManifest(manifest) {
  const path = `${MANIFEST_PREFIX}${Date.now()}.json`;
  await put(path, JSON.stringify(manifest), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // Nettoyage best-effort des versions antérieures
  try {
    const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 100 });
    const old = blobs.filter((b) => b.pathname !== path);
    if (old.length) await del(old.map((b) => b.url));
  } catch {
    // pas grave, nettoyé au prochain save
  }
}

export async function saveHtmlFile(slug, content) {
  const blob = await put(`library/docs/${slug}.html`, content, {
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
