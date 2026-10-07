// Constantes pures, sans next/headers — importables depuis un composant
// client (components/LangToggle.js) SANS entraîner next/headers dans le
// bundle client. lib/i18n.js (Server Component only) réexporte ces mêmes
// valeurs : une seule source, deux points d'entrée selon le contexte.
//
// Quatre langues (2026-10) : les quatre que portent aussi TOUS les modules
// de la bibliothèque. Ajouter une langue ici sans l'ajouter au dictionnaire
// (lib/i18n-dict.js), aux titres (lib/taxonomy.js) et aux modules afficherait
// des trous — l'ordre est celui du sélecteur.
export const LANGS = ["fr", "en", "es", "de"];
export const DEFAULT_LANG = "fr";
export const LANG_COOKIE = "gexLang";

// Nom natif (menu du sélecteur) et locale Intl (dates). Une seule table,
// jamais un ternaire fr/en recopié — même contrat que SHELL_LANG_META.
export const LANG_META = {
  fr: { name: "Français", locale: "fr-FR" },
  en: { name: "English", locale: "en-US" },
  es: { name: "Español", locale: "es-ES" },
  de: { name: "Deutsch", locale: "de-DE" },
};
