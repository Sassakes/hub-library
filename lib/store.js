import { put, del, list } from "@vercel/blob";
import { unstable_cache, revalidateTag } from "next/cache";

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

// "module" (défaut) | "annex" | "capstone" — voir lib/taxonomy.js. Aujourd'hui
// le classement réel vient des listes figées ANNEX_SLUGS/CAPSTONE_SLUGS ; ce
// champ permet à un futur bascule admin de les surclasser sans migration de
// code. Toute valeur inconnue retombe sur "module" — jamais d'erreur sur une
// donnée de manifest.
const DOC_KINDS = new Set(["module", "annex", "capstone"]);
function sanitizeKind(v) {
  return DOC_KINDS.has(v) ? v : "module";
}

function normalize(data) {
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    docs: (Array.isArray(data.docs) ? data.docs : []).map((d) => ({
      ...d,
      indicator: sanitizeIndicator(d.indicator),
      kind: sanitizeKind(d.kind),
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

/* Lecture PUBLIQUE mise en cache.
   getManifest() coûte DEUX allers-retours réseau en série (list() pour
   trouver la version la plus récente, puis fetch du JSON), payés à chaque
   requête. Les pages publiques le relisaient intégralement à chaque
   navigation alors que le manifest ne bouge qu'à une sauvegarde admin.

   ⚠ Réservé aux lectures publiques. Les routes /api/admin/* font du
   read-modify-write : elles DOIVENT continuer d'appeler getManifest() non
   caché. Une lecture périmée suivie d'un PUT réécrirait le manifest à
   partir d'un état ancien et ferait disparaître silencieusement les
   documents ajoutés entre-temps (cf. le filtre de route.js qui ne
   réinjecte jamais un doc absent du payload).

   revalidate sert de filet : même si la purge par tag échouait, la
   fraîcheur est bornée. */
export const MANIFEST_TAG = "hub-manifest";

/* ⚠ NE JAMAIS METTRE EN CACHE UN MANIFEST VIDE.
   getManifest() renvoie EMPTY_MANIFEST aussi bien pour "bibliothèque
   réellement vide" que pour "la lecture a échoué" (fetchJson qui rend
   null sur un coup de réseau), et list() peut carrément lever.

   Sans ce garde-fou, une panne Blob de quelques secondes serait figée
   dans le cache : la bibliothèque afficherait 0 module pendant 300 s,
   sans erreur, et ne se rétablirait qu'à l'expiration. C'est très
   exactement pire que l'absence de cache, qui se répare toute seule à
   la requête suivante.

   Lever à l'intérieur du callback empêche unstable_cache de mémoriser le
   résultat ; on rattrape juste en dessous et on dégrade pour CETTE
   requête seulement, la suivante réessaie. Effet de bord assumé : une
   bibliothèque authentiquement vide (installation neuve) n'est jamais
   mise en cache — ce qui est souhaitable, le premier upload apparaît
   alors immédiatement. */
const readManifestForCache = unstable_cache(
  async () => {
    const manifest = await getManifest();
    if (!manifest.docs.length && !manifest.categories.length) {
      throw new Error("manifest vide ou illisible — on ne met pas en cache");
    }
    return manifest;
  },
  ["hub-manifest"],
  { tags: [MANIFEST_TAG], revalidate: 300 }
);

export async function getManifestCached() {
  try {
    return await readManifestForCache();
  } catch {
    // Échec NON mis en cache. Rendre une page vide plutôt qu'une 500 :
    // list() lève sur panne Blob et cette exception remontait jusqu'au
    // rendu (constaté en local : digest d'erreur Next sur la page
    // d'accueil). La requête suivante refait une vraie tentative.
    return structuredClone(EMPTY_MANIFEST);
  }
}

export async function saveManifest(manifest) {
  const path = `${MANIFEST_PREFIX}${Date.now()}.json`;
  await put(path, JSON.stringify(manifest), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // Purge du cache de lecture publique : sans ça, une modification admin
  // resterait invisible jusqu'à l'expiration du revalidate. Placé ici
  // plutôt que chez les trois appelants — un oubli côté appelant se
  // traduirait par une page publique figée, sans erreur visible.
  try {
    revalidateTag(MANIFEST_TAG);
  } catch {
    // Hors contexte de requête (revalidateTag exige un Route Handler ou
    // une Server Action) : le revalidate ci-dessus prend le relais.
  }
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
