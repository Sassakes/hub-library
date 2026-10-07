// Dictionnaire et formatteurs — PURS, sans next/headers. Séparés de
// lib/i18n.js (Server Component only) pour rester importables depuis
// n'importe quel contexte (composant client, script Node de test) sans
// entraîner next/headers dans leur graphe d'import. Même raison que le
// split lib/i18n-constants.js pour LangToggle.js.

import { LANG_META } from "@/lib/i18n-constants";

export function fmtDate(ts, lang) {
  return new Date(ts).toLocaleDateString((LANG_META[lang] || LANG_META.fr).locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtSize(bytes, lang) {
  const kb = Math.round((bytes || 0) / 1024);
  return lang === "fr" ? `${kb} Ko` : `${kb} KB`;
}

// Quatre langues, même jeu de clés pour chacune (vérifié par
// scripts/check-i18n.mjs). FR/EN reprises de hub-redesign-preview.html ;
// ES/DE ajoutées 2026-10 avec la traduction des modules. Les titres du manifest, "MODULE NN", les noms propres et les
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

    langLabel: "Langue",
    backToLibrary: "← bibliothèque",
    indicatorCta: "indicateur ↗",
    uncategorized: "Sans catégorie",
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

    langLabel: "Language",
    backToLibrary: "← library",
    indicatorCta: "indicator ↗",
    uncategorized: "Uncategorized",
  },
  es: {
    terminal: "Terminal",
    tradingview: "TradingView",
    discord: "Discord",
    admin: "admin",

    heroEyebrow: "Biblioteca · acceso para miembros",
    heroHeadlineHtml: "La base teórica<br>detrás del <em>Terminal</em>.",
    heroBody:
      "Cuatro itinerarios para seguir en orden: desde la lectura del flujo hasta la capa de opciones. Cada módulo es una explicación autónoma, pensada para releerla en plena sesión.",
    statModules: "módulos",
    statTracks: "itinerarios",
    statIndicators: "indicadores",
    proofSuffix: "traders han aprendido algo aquí",

    all: "Todo",
    trackWord: "itinerario",
    modulesWord: "módulos",
    comingWord: "próximamente",
    annexesWord: "anexos",
    appendicesLabel: "anexos — fuera del itinerario",

    empty: "Todavía no hay documentos. Usa el panel de administración para subir tus archivos .html.",

    moduleLabel: "MÓDULO",
    soonSuffix: "PRÓXIMAMENTE",
    soonNote: "propuesta — por escribir",
    indicatorTag: "indicador",
    referenceTag: "referencia",

    toolbeltTitle: "La caja de herramientas",
    toolbeltSub: "indicadores Pine Script — para cargar en TradingView",
    toolbeltScripts: (n) => `${n} scripts publicados · TradingView`,
    viewProfile: "Ver perfil",
    pineTag: "pine",
    allScripts: "Todos los scripts publicados",
    tvProfile: "perfil de TradingView",

    footerBrand: "The Hub · Library",

    langLabel: "Idioma",
    backToLibrary: "← biblioteca",
    indicatorCta: "indicador ↗",
    uncategorized: "Sin categoría",
  },
  de: {
    terminal: "Terminal",
    tradingview: "TradingView",
    discord: "Discord",
    admin: "admin",

    heroEyebrow: "Bibliothek · Mitgliederbereich",
    heroHeadlineHtml: "Das theoretische Fundament<br>hinter dem <em>Terminal</em>.",
    heroBody:
      "Vier Lernpfade, die du der Reihe nach durchgehst — vom Lesen des Orderflows bis zur Optionsebene. Jedes Modul ist eine eigenständige Erklärung, gemacht zum Nachlesen mitten in der Session.",
    statModules: "Module",
    statTracks: "Lernpfade",
    statIndicators: "Indikatoren",
    proofSuffix: "Trader haben hier etwas gelernt",

    all: "Alle",
    trackWord: "Lernpfad",
    modulesWord: "Module",
    comingWord: "in Arbeit",
    annexesWord: "Anhänge",
    appendicesLabel: "Anhänge — außerhalb des Lernpfads",

    empty: "Noch keine Dokumente. Lade deine .html-Dateien über den Admin-Bereich hoch.",

    moduleLabel: "MODUL",
    soonSuffix: "BALD",
    soonNote: "Vorschlag — noch zu schreiben",
    indicatorTag: "Indikator",
    referenceTag: "Referenz",

    toolbeltTitle: "Der Werkzeugkasten",
    toolbeltSub: "Pine-Script-Indikatoren — zum Laden in TradingView",
    toolbeltScripts: (n) => `${n} veröffentlichte Skripte · TradingView`,
    viewProfile: "Profil ansehen",
    pineTag: "pine",
    allScripts: "Alle veröffentlichten Skripte",
    tvProfile: "TradingView-Profil",

    footerBrand: "The Hub · Library",

    langLabel: "Sprache",
    backToLibrary: "← Bibliothek",
    indicatorCta: "Indikator ↗",
    uncategorized: "Ohne Kategorie",
  },
};
