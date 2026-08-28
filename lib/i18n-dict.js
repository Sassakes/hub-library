// Dictionnaire et formatteurs — PURS, sans next/headers. Séparés de
// lib/i18n.js (Server Component only) pour rester importables depuis
// n'importe quel contexte (composant client, script Node de test) sans
// entraîner next/headers dans leur graphe d'import. Même raison que le
// split lib/i18n-constants.js pour LangToggle.js.

export function fmtDate(ts, lang) {
  return new Date(ts).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtSize(bytes, lang) {
  const kb = Math.round((bytes || 0) / 1024);
  return lang === "en" ? `${kb} KB` : `${kb} Ko`;
}

// Paires FR/EN reprises de hub-redesign-preview.html (53 paires vérifiées
// complètes). Les titres du manifest, "MODULE NN", les noms propres et les
// noms de marque ne sont PAS traduits — voir HANDOFF §4 "Strings".
export const dict = {
  fr: {
    terminal: "Terminal",
    tradingview: "TradingView",
    discord: "Discord",
    admin: "admin",

    heroEyebrow: "Bibliothèque · accès membres",
    heroHeadlineHtml: "Le socle théorique<br>derrière le <em>Terminal</em>.",
    heroBody:
      "Quatre parcours à suivre dans l'ordre — de la lecture du flux jusqu'à la couche options. Chaque module est un explainer autonome, pensé pour être relu en séance.",
    statModules: "modules",
    statTracks: "parcours",
    statIndicators: "indicateurs",
    proofSuffix: "traders ont appris quelque chose ici",
    searchPlaceholder: "Rechercher un module…",

    all: "Tout",
    trackWord: "parcours",
    modulesWord: "modules",
    comingWord: "à venir",
    annexesWord: "annexes",
    appendicesLabel: "annexes — hors parcours",

    empty: "Aucun document pour l'instant. Passe par l'admin pour uploader tes .html.",

    moduleLabel: "MODULE",
    soonSuffix: "À VENIR",
    soonNote: "proposition — à écrire",
    indicatorTag: "indicateur",
    referenceTag: "référence",

    toolbeltTitle: "La boîte à outils",
    toolbeltSub: "indicateurs Pine Script — à charger sur TradingView",
    toolbeltScripts: (n) => `${n} scripts publiés · TradingView`,
    viewProfile: "Voir le profil",
    pineTag: "pine",
    allScripts: "Tous les scripts publiés",
    tvProfile: "profil TradingView",

    footerBrand: "The Hub · Library",
  },
  en: {
    terminal: "Terminal",
    tradingview: "TradingView",
    discord: "Discord",
    admin: "admin",

    heroEyebrow: "Library · members access",
    heroHeadlineHtml: "The theory<br>behind the <em>Terminal</em>.",
    heroBody:
      "Four tracks meant to be followed in order — from reading flow all the way to the options layer. Every module is a standalone explainer, built to be re-read mid-session.",
    statModules: "modules",
    statTracks: "tracks",
    statIndicators: "indicators",
    proofSuffix: "traders have learnt something here",
    searchPlaceholder: "Search a module…",

    all: "All",
    trackWord: "track",
    modulesWord: "modules",
    comingWord: "coming",
    annexesWord: "appendices",
    appendicesLabel: "appendices — outside the track",

    empty: "No document yet. Use the admin panel to upload your .html files.",

    moduleLabel: "MODULE",
    soonSuffix: "SOON",
    soonNote: "proposed — to write",
    indicatorTag: "indicator",
    referenceTag: "reference",

    toolbeltTitle: "The toolbelt",
    toolbeltSub: "Pine Script indicators — load them on TradingView",
    toolbeltScripts: (n) => `${n} published scripts · TradingView`,
    viewProfile: "View profile",
    pineTag: "pine",
    allScripts: "All published scripts",
    tvProfile: "TradingView profile",

    footerBrand: "The Hub · Library",
  },
};
