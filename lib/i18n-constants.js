// Constantes pures, sans next/headers — importables depuis un composant
// client (components/LangToggle.js) SANS entraîner next/headers dans le
// bundle client. lib/i18n.js (Server Component only) réexporte ces mêmes
// valeurs : une seule source, deux points d'entrée selon le contexte.
export const LANGS = ["fr", "en"];
export const DEFAULT_LANG = "fr";
export const LANG_COOKIE = "gexLang";
