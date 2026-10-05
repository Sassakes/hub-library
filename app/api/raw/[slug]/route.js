import { cookies } from "next/headers";
import { getManifestCached } from "@/lib/store";
import { LANGS, DEFAULT_LANG, LANG_COOKIE } from "@/lib/i18n-constants";

export const revalidate = 0;

/* Réponse d'erreur SOMBRE.
   Ce contenu s'affiche à l'intérieur de l'iframe du lecteur. Une réponse
   en texte brut y est rendue par le navigateur sur fond blanc : au milieu
   d'une interface entièrement sombre, une erreur devenait un éblouissement
   plein écran. Le fond de l'iframe (globals.css) ne suffit pas ici — c'est
   le document lui-même qui peint sa propre page.

   Les tokens sont écrits en dur : ce document est autonome, il ne charge
   pas globals.css. Valeurs alignées sur --bg / --muted / --line du thème. */
// Messages d'erreur dans la langue du visiteur (cookie partagé), français
// par défaut. Le document servi en cas de succès gère sa langue lui-même.
const ERRORS = {
  unavailable: {
    fr: "Bibliothèque momentanément indisponible.",
    en: "The library is temporarily unavailable.",
    es: "La biblioteca no está disponible por el momento.",
    de: "Die Bibliothek ist vorübergehend nicht verfügbar.",
  },
  notFound: {
    fr: "Document introuvable.",
    en: "Document not found.",
    es: "Documento no encontrado.",
    de: "Dokument nicht gefunden.",
  },
  readError: {
    fr: "Erreur de lecture du document.",
    en: "The document could not be read.",
    es: "No se pudo leer el documento.",
    de: "Das Dokument konnte nicht gelesen werden.",
  },
};

function errorLang() {
  try {
    const v = cookies().get(LANG_COOKIE)?.value;
    return LANGS.includes(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function darkError(key, status) {
  const lang = errorLang();
  const message = ERRORS[key][lang];
  const body = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{height:100%;margin:0}
  body{
    background:#0A0A0C; color:#8A8A94;
    font-family:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size:13px; display:grid; place-items:center; text-align:center; padding:24px;
  }
  .box{border:1px solid #212127; border-radius:10px; padding:20px 24px; max-width:420px}
</style></head>
<body><div class="box">${message}</div></body></html>`;
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(_request, { params }) {
  let doc;
  try {
    const manifest = await getManifestCached();
    doc = manifest.docs.find((d) => d.slug === params.slug);
  } catch {
    return darkError("unavailable", 503);
  }

  if (!doc || !doc.blobUrl) {
    return darkError("notFound", 404);
  }

  let res;
  try {
    res = await fetch(doc.blobUrl, { cache: "no-store" });
  } catch {
    // fetch qui lève (réseau/URL invalide) : sans ce catch la route rendait
    // une 500 Next non stylée, donc blanche dans l'iframe.
    return darkError("readError", 502);
  }
  if (!res.ok) {
    return darkError("readError", 502);
  }

  const html = await res.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
