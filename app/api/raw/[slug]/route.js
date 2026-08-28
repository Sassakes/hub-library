import { getManifestCached } from "@/lib/store";

export const revalidate = 0;

/* Réponse d'erreur SOMBRE.
   Ce contenu s'affiche à l'intérieur de l'iframe du lecteur. Une réponse
   en texte brut y est rendue par le navigateur sur fond blanc : au milieu
   d'une interface entièrement sombre, une erreur devenait un éblouissement
   plein écran. Le fond de l'iframe (globals.css) ne suffit pas ici — c'est
   le document lui-même qui peint sa propre page.

   Les tokens sont écrits en dur : ce document est autonome, il ne charge
   pas globals.css. Valeurs alignées sur --bg / --muted / --line du thème. */
function darkError(message, status) {
  const body = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
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
    return darkError("Bibliothèque momentanément indisponible.", 503);
  }

  if (!doc || !doc.blobUrl) {
    return darkError("Document introuvable.", 404);
  }

  let res;
  try {
    res = await fetch(doc.blobUrl, { cache: "no-store" });
  } catch {
    // fetch qui lève (réseau/URL invalide) : sans ce catch la route rendait
    // une 500 Next non stylée, donc blanche dans l'iframe.
    return darkError("Erreur de lecture du document.", 502);
  }
  if (!res.ok) {
    return darkError("Erreur de lecture du document.", 502);
  }

  const html = await res.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
