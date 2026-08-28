import { cookies } from "next/headers";
import { LANGS, DEFAULT_LANG, LANG_COOKIE } from "@/lib/i18n-constants";
import { dict, fmtDate, fmtSize } from "@/lib/i18n-dict";

// Point d'entrée SERVER-ONLY : le seul fichier i18n qui touche next/headers.
// app/page.js et app/layout.js importent tout depuis "@/lib/i18n" — cette
// réexportation évite d'avoir à se souvenir de qui vient d'où. Un composant
// CLIENT (LangToggle.js) ou un script Node (test-rendering-logic.mjs)
// importe directement "@/lib/i18n-constants" / "@/lib/i18n-dict" à la
// place, pour ne jamais entraîner next/headers dans leur graphe.
export { LANGS, DEFAULT_LANG, LANG_COOKIE, dict, fmtDate, fmtSize };

// Contrat identique au terminal (dash.gexdash.app/shell.js) : même nom de
// clé, mêmes valeurs, même défaut. Voir HANDOFF §4 — la persistance est un
// cookie ici (pas localStorage) parce que la page d'accueil est un Server
// Component : lire un cookie au rendu est possible, lire localStorage ne
// l'est pas, et un swap client produirait un flash de la mauvaise langue.
export function getLang() {
  const v = cookies().get(LANG_COOKIE)?.value;
  return LANGS.includes(v) ? v : DEFAULT_LANG;
}
