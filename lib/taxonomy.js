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
  cat_b5uc1a5: { fr: "le socle", en: "the foundation" },
  cat_ajj2huj: { fr: "l'outil de lecture", en: "the reading tool" },
  cat_dca76i5: { fr: "le modèle", en: "the model" },
  cat_kw3ojes: { fr: "la couche options", en: "the options layer" },
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
  "presentation-hub": "indicator",
  "gex-gamma-notes": "notes",
};

// ── Modules "à venir" — PAS des documents. Aucun blob, aucune entrée
// manifest. `at` = position 1-indexée dans la séquence combinée du
// parcours ; voir buildTrackSlots() dans app/page.js pour l'interleaving
// avec les modules réels. Rendus en <div> non cliquable, jamais <a>. ──
export const COMING_SOON = {
  cat_b5uc1a5: [
    // ORDER FLOW
    {
      at: 1,
      icon: "orderbook",
      fr: "Le carnet d'ordres & la profondeur",
      en: "The order book & depth",
    },
    { at: 3, icon: "bars", fr: "Delta & CVD", en: "Delta & CVD" },
  ],
  cat_ajj2huj: [
    // FOOT PRINT
    {
      at: 1,
      icon: "footanatomy",
      fr: "Lire un footprint : anatomie",
      en: "Reading a footprint: anatomy",
    },
  ],
  cat_dca76i5: [
    // ICT
    {
      at: 3,
      icon: "structure",
      fr: "Market structure : BOS & CHOCH",
      en: "Market structure: BOS & CHOCH",
    },
    {
      at: 4,
      icon: "pools",
      fr: "Liquidity pools : buyside & sellside",
      en: "Liquidity pools: buyside & sellside",
    },
  ],
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
  return slots;
}
