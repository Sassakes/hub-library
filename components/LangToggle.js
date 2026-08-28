"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE } from "@/lib/i18n-constants";

// Composant client minimal : pose le cookie, puis force un nouveau rendu
// SERVEUR (router.refresh(), pas de state React) pour que le HTML renvoyé
// soit déjà dans la bonne langue — pas de flash, pas de hors de portée pour
// les moteurs de recherche sur le contenu français par défaut.
export default function LangToggle({ lang }) {
  const router = useRouter();

  function setLang(l) {
    if (l === lang) return;
    // Portée sur .gexdash.app (domaine parent), pas sur l'hôte : sans effet
    // aujourd'hui, mais prépare une synchronisation future avec le terminal
    // sans nouvelle migration. Sur localhost/preview Vercel, .gexdash.app
    // n'est pas un domaine valide pour ce host — le navigateur rejetterait
    // silencieusement le cookie, donc on omet l'attribut Domain hors prod.
    //
    // Comparaison EXACTE ou sous-domaine (pas endsWith("gexdash.app") nu,
    // qui matcherait aussi un hôte non apparenté comme "notgexdash.app").
    // Sans conséquence réelle ici — un navigateur refuse de toute façon
    // qu'une page pose un cookie Domain=.gexdash.app si son propre hôte
    // n'est pas gexdash.app ou un sous-domaine — mais c'est le bon motif.
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const onGexdash = host === "gexdash.app" || host.endsWith(".gexdash.app");
    const domainAttr = onGexdash ? "; domain=.gexdash.app" : "";
    const secureAttr = typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}${domainAttr}; samesite=lax${secureAttr}`;
    router.refresh();
  }

  return (
    <div className="appLang" role="group" aria-label="Langue / Language">
      <button type="button" data-l="fr" aria-pressed={lang === "fr"} className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>
        FR
      </button>
      <button type="button" data-l="en" aria-pressed={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}
