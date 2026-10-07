// Connaissance de curriculum — comment le manifest se lit comme un parcours.
// Ce fichier ne modifie AUCUNE donnée du manifest : il ajoute une couche de
// présentation par-dessus (accent, glyphe, statut annexe/capstone, contenu
// "à venir"). Voir HANDOFF-hub-redesign.md §2.3 / §2.6.

// ── Annexes : hors numérotation, restent dans leur catégorie GEX ──
export const ANNEX_SLUGS = new Set(["gex-gamma-notes", "presentation-hub"]);

// ── Capstone : numéroté normalement, mais suppose deux parcours ──
export const CAPSTONE_SLUGS = new Set(["footprint-execution-ict"]);

export function isAnnex(doc) {
  return doc.kind === "annex" || ANNEX_SLUGS.has(doc.slug);
}

export function isCapstone(doc) {
  return doc.kind === "capstone" || CAPSTONE_SLUGS.has(doc.slug);
}

// ── Identité par parcours (id catégorie manifest → présentation) ──
export const TRACK_ACCENT = {
  cat_b5uc1a5: "p-flow", // ORDER FLOW
  cat_ajj2huj: "p-foot", // FOOT PRINT
  cat_dca76i5: "p-ict", // ICT
  cat_kw3ojes: "p-gex", // OPTIONS / GEX
};

export const TRACK_ICON = {
  cat_b5uc1a5: "flow",
  cat_ajj2huj: "foot",
  cat_dca76i5: "candles",
  cat_kw3ojes: "gamma",
};

export const TRACK_TAGLINE = {
  cat_b5uc1a5: { fr: "le socle", en: "the foundation", es: "la base", de: "das Fundament" },
  cat_ajj2huj: { fr: "l'outil de lecture", en: "the reading tool", es: "la herramienta de lectura", de: "das Lesewerkzeug" },
  cat_dca76i5: { fr: "le modèle", en: "the model", es: "el modelo", de: "das Modell" },
  cat_kw3ojes: { fr: "la couche options", en: "the options layer", es: "la capa de opciones", de: "die Optionsebene" },
};

// ── Glyphe par document réel (undefined → repli sur TRACK_ICON) ──
export const DOC_ICON = {
  "orderflow-fondamentaux": "flow",
  "orderflow-open-us": "flow",
  "breakout-mastery": "foot",
  "breakout-mastery-2": "foot",
  "gb-time-presentation": "candles",
  "gb-time-lexique": "book",
  "fvg-ifvg-masterclass": "candles",
  "rejection-blocks": "block",
  "po3-amd": "zigzag",
  "footprint-execution-ict": "star", // capstone
  "01-les-greeks": "gamma",
  "02-positionnement-dealer-gex": "gamma",
  "03-vex-regimes-volatilite": "gamma",
  "04-lire-une-carte-gamma": "gamma",
  "05-execution-et-regimes": "gamma",
  "06-flux-institutionnel-dark-pools": "gamma",
  // Modules publiés 2026-08-30 — reprennent les glyphes de leurs placeholders
  "footprint-anatomie": "footanatomy",
  "market-structure-bos-choch": "structure",
  "liquidity-pools": "pools",
  "order-blocks-breakers": "block",
  "delta-cvd-divergences": "divergence",
  "volume-profile-vwap": "volume",
  "presentation-hub": "indicator",
  "gex-gamma-notes": "notes",
};

// ── Titre traduit par document. Le manifest ne porte qu'un seul `title`
// (schéma admin, en français) ; les autres langues sont déclarées ici
// plutôt que d'inventer un champ que l'admin ne sait pas éditer.
//
// `fr` n'est utilisé QUE si le titre du manifest est encore le titre
// automatique dérivé du slug à l'upload ("Po3 Amd", "Fvg Ifvg Masterclass") :
// un titre renommé à la main dans l'admin reste prioritaire en français.
// Repli silencieux sur doc.title pour un slug non listé (futur module). ──
export const DOC_TITLE_I18N = {
  "orderflow-fondamentaux": { fr: "Order flow : les fondamentaux", en: "Order flow: the fundamentals", es: "Order flow: los fundamentos", de: "Orderflow: die Grundlagen" },
  "volume-profile-vwap": { en: "Volume Profile & VWAP", es: "Volume Profile y VWAP", de: "Volume Profile & VWAP" },
  "delta-cvd-divergences": { en: "Delta & CVD: divergences and traps", es: "Delta y CVD: divergencias y trampas", de: "Delta & CVD: Divergenzen und Fallen" },
  "orderflow-open-us": { fr: "Order flow : lire l'open US", en: "Order flow: reading the US open", es: "Order flow: leer la apertura de EE. UU.", de: "Orderflow: die US-Eröffnung lesen" },
  "footprint-anatomie": { en: "Reading a footprint: anatomy", es: "Leer un footprint: anatomía", de: "Einen Footprint lesen: Anatomie" },
  "breakout-mastery": { en: "Breakout Mastery", es: "Breakout Mastery", de: "Breakout Mastery" },
  "breakout-mastery-2": { fr: "Breakout Mastery 2 : la carte des niveaux", en: "Breakout Mastery 2: the level map", es: "Breakout Mastery 2: el mapa de niveles", de: "Breakout Mastery 2: die Level-Karte" },
  "gb-time-lexique": { fr: "Glossaire", en: "Glossary", es: "Glosario", de: "Glossar" },
  "market-structure-bos-choch": { en: "Market structure: BOS & CHOCH", es: "Estructura de mercado: BOS y CHOCH", de: "Marktstruktur: BOS & CHOCH" },
  "liquidity-pools": { en: "Liquidity pools: buyside & sellside", es: "Liquidity pools: buyside y sellside", de: "Liquidity Pools: Buyside & Sellside" },
  "fvg-ifvg-masterclass": { fr: "FVG / iFVG : masterclass", en: "FVG / iFVG: masterclass", es: "FVG / iFVG: masterclass", de: "FVG / iFVG: Masterclass" },
  "order-blocks-breakers": { en: "Order blocks & breakers", es: "Order blocks y breakers", de: "Order Blocks & Breaker" },
  "rejection-blocks": { en: "Rejection blocks", es: "Rejection blocks", de: "Rejection Blocks" },
  "po3-amd": { fr: "PO3 / AMD : le cycle", en: "PO3 / AMD: the cycle", es: "PO3 / AMD: el ciclo", de: "PO3 / AMD: der Zyklus" },
  "footprint-execution-ict": { fr: "Footprint × ICT : l'exécution", en: "Footprint × ICT: execution", es: "Footprint × ICT: la ejecución", de: "Footprint × ICT: die Ausführung" },
  "01-les-greeks": { en: "The Greeks", es: "Las griegas", de: "Die Griechen" },
  "02-positionnement-dealer-gex": { fr: "Positionnement dealer & GEX", en: "Dealer positioning & GEX", es: "Posicionamiento de los dealers y GEX", de: "Dealer-Positionierung & GEX" },
  "03-vex-regimes-volatilite": { fr: "VEX & régimes de volatilité", en: "VEX & volatility regimes", es: "VEX y regímenes de volatilidad", de: "VEX & Volatilitätsregime" },
  "04-lire-une-carte-gamma": { fr: "Lire une carte gamma", en: "Reading a gamma map", es: "Leer un mapa gamma", de: "Eine Gamma-Karte lesen" },
  "05-execution-et-regimes": { fr: "Exécution & régimes", en: "Execution & regimes", es: "Ejecución y regímenes", de: "Ausführung & Regime" },
  "06-flux-institutionnel-dark-pools": { fr: "Flux institutionnel & dark pools", en: "Institutional flow & dark pools", es: "Flujo institucional y dark pools", de: "Institutioneller Flow & Dark Pools" },
  "gex-gamma-notes": { fr: "GEX & gamma : notes de terrain", en: "GEX & gamma: field notes", es: "GEX y gamma: notas de campo", de: "GEX & Gamma: Notizen aus der Praxis" },
};

// "Fvg Ifvg Masterclass" ← "fvg-ifvg-masterclass" : le titre que l'upload
// fabrique à partir du nom de fichier. Comparaison insensible aux accents,
// à la casse et à la ponctuation.
function isSlugTitle(doc) {
  const norm = (x) =>
    (x || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return norm(doc.title) === norm(doc.slug);
}

export function docTitle(doc, lang) {
  const t = DOC_TITLE_I18N[doc.slug];
  if (!t) return doc.title;
  if (lang === "fr") return isSlugTitle(doc) && t.fr ? t.fr : doc.title;
  return t[lang] || t.en || doc.title;
}

// ── Modules "à venir" — PAS des documents. Aucun blob, aucune entrée
// manifest. `at` = position 1-indexée dans la séquence combinée du
// parcours ; voir buildTrackSlots() dans app/page.js pour l'interleaving
// avec les modules réels. Rendus en <div> non cliquable, jamais <a>. ──
export const COMING_SOON = {
  // Les cinq entrées précédentes (order book, Delta & CVD, anatomie du footprint,
  // market structure, liquidity pools) sont devenues des modules réels le
  // 2026-08-30. Les parcours n'ont plus de placeholder ; buildTrackSlots()
  // numérote alors la séquence en continu sans recalage.
  cat_b5uc1a5: [], // ORDER FLOW
  cat_ajj2huj: [], // FOOT PRINT
  cat_dca76i5: [], // ICT
};

// ── Icône par ligne de la boîte à outils, devinée par mot-clé sur le nom
// du script (manifest.links.scripts est éditable en admin, donc pas de
// liste figée par nom exact — un futur script non reconnu retombe sur
// "chart" plutôt que de casser le rendu). ──
export function scriptIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("cvd") || n.includes("divergence")) return "divergence";
  if (n.includes("ema")) return "ema";
  if (n.includes("volum") || n.includes("fvg") || n.includes("gap")) return "volume";
  return "chart";
}

// ── Combine modules réels + entrées "à venir" en une séquence numérotée
// continue. Voir HANDOFF §2.6 : "interleave avec les modules réels pour
// que la numérotation soit continue". ──
export function buildTrackSlots(modules, soon) {
  const total = modules.length + soon.length;
  const bySoonPos = new Map(soon.map((s) => [s.at, s]));

  // Garde-fou pour un futur edit de COMING_SOON, pas pour aujourd'hui (les
  // entrées actuelles sont vérifiées par test-rendering-logic.mjs). Un `at`
  // dupliqué écrase silencieusement l'entrée précédente dans le Map, et un
  // `at` hors de [1, total] ne se voit jamais consommer — dans les deux
  // cas, un module réel se retrouverait déplacé ou une entrée "à venir"
  // disparaîtrait du site sans qu'aucune erreur ne le signale. Seulement
  // en dev : ce n'est pas une alerte à faire remonter à chaque requête
  // publique si elle se maintient (peu probable, mais pas la peine).
  if (process.env.NODE_ENV !== "production" && bySoonPos.size !== soon.length) {
    console.warn(`[taxonomy] COMING_SOON contient des positions "at" en double : ${soon.map((s) => s.at)}`);
  }

  const slots = [];
  let mi = 0;
  for (let pos = 1; pos <= total; pos++) {
    const num = String(pos).padStart(2, "0");
    if (bySoonPos.has(pos)) {
      slots.push({ type: "soon", num, data: bySoonPos.get(pos) });
    } else {
      slots.push({ type: "doc", num, data: modules[mi++] });
    }
  }

  if (process.env.NODE_ENV !== "production" && mi !== modules.length) {
    console.warn(
      `[taxonomy] buildTrackSlots: ${mi}/${modules.length} modules placés — vérifie les "at" de COMING_SOON (doivent être dans [1, ${total}], uniques).`
    );
  }

  return slots;
}
