import { cookies, headers } from "next/headers";
import { LANGS, DEFAULT_LANG, LANG_COOKIE, LANG_META } from "@/lib/i18n-constants";
import { dict, fmtDate, fmtSize } from "@/lib/i18n-dict";

// Point d'entrée SERVER-ONLY : le seul fichier i18n qui touche next/headers.
// app/page.js et app/layout.js importent tout depuis "@/lib/i18n" — cette
// réexportation évite d'avoir à se souvenir de qui vient d'où. Un composant
// CLIENT (LangToggle.js) ou un script Node (test-rendering-logic.mjs)
// importe directement "@/lib/i18n-constants" / "@/lib/i18n-dict" à la
// place, pour ne jamais entraîner next/headers dans leur graphe.
export { LANGS, DEFAULT_LANG, LANG_COOKIE, LANG_META, dict, fmtDate, fmtSize };

// Langue PRINCIPALE annoncée par le navigateur ("de" pour "de-CH,de;q=0.9,en"),
// si elle est proposée. Seule la première entrée compte — même règle que
// resolveInitialLanguage() du terminal : une langue secondaire n'est jamais
// imposée par défaut.
function primaryAcceptLanguage() {
  const raw = headers().get("accept-language") || "";
  const first = raw.split(",")[0]?.trim().toLowerCase().split(/[-_;]/)[0];
  return LANGS.includes(first) ? first : null;
}

// Contrat identique au terminal (dash.gexdash.app/shell.js) : même nom de
// clé, mêmes valeurs. La persistance est un cookie ici (pas localStorage)
// parce que la page d'accueil est un Server Component : lire un cookie au
// rendu est possible, lire localStorage ne l'est pas, et un swap client
// produirait un flash de la mauvaise langue.
// Priorité : choix explicite (cookie) → langue principale du navigateur
// (1re visite seulement : rien n'est écrit tant que le visiteur n'a pas
// choisi) → français.
export function getLang() {
  const v = cookies().get(LANG_COOKIE)?.value;
  if (LANGS.includes(v)) return v;
  return primaryAcceptLanguage() || DEFAULT_LANG;
}
