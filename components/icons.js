// Glyphes SVG repris trait pour trait de hub-redesign-preview.html (aperçu
// v4 approuvé). Chaque icône de contenu partage le même contrat visuel
// (fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap
// "round") pour que `.thumb`/`.secglyph`/`.tb-ic` en globals.css les
// dimensionnent identiquement, sans le redéclarer à chaque appel.

function Glyph({ children, strokeWidth = "1.9", strokeLinejoin }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin={strokeLinejoin}
    >
      {children}
    </svg>
  );
}

// ── Glyphes de parcours (secglyph + thumb par défaut) ──
const IconFlow = () => (
  <Glyph>
    <path d="M3 6h11" />
    <path d="M3 12h17" />
    <path d="M3 18h8" />
    <path d="M17 3l3 3-3 3" />
  </Glyph>
);
const IconFoot = () => (
  <Glyph>
    <rect x="3" y="4" width="7" height="4" rx="1" />
    <rect x="3" y="10" width="5" height="4" rx="1" />
    <rect x="3" y="16" width="8" height="4" rx="1" />
    <rect x="14" y="4" width="5" height="4" rx="1" />
    <rect x="14" y="10" width="7" height="4" rx="1" />
    <rect x="14" y="16" width="4" height="4" rx="1" />
  </Glyph>
);
const IconCandles = () => (
  <Glyph>
    <path d="M7 3v18" />
    <rect x="4.5" y="7" width="5" height="8" rx="1" />
    <path d="M17 3v18" />
    <rect x="14.5" y="10" width="5" height="7" rx="1" />
  </Glyph>
);
const IconGamma = () => (
  <Glyph>
    <path d="M3 18c4 0 5-11 9-11s5 11 9 11" />
    <path d="M12 3v18" strokeDasharray="2 2.5" />
  </Glyph>
);

// ── Glyphes par module / annexe ──
const IconIndicator = () => (
  <Glyph strokeWidth="2" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </Glyph>
);
const IconOrderBook = () => (
  <Glyph>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 10h16M4 15h16M12 4v16" />
  </Glyph>
);
const IconBars = () => (
  <Glyph>
    <path d="M3 20V10M9 20V4M15 20v-7M21 20V7" />
  </Glyph>
);
const IconFootAnatomy = () => (
  <Glyph>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M12 3v18M4 9h16M4 15h16" />
  </Glyph>
);
const IconBook = () => (
  <Glyph>
    <path d="M5 4h14v16H5z" />
    <path d="M8.5 9h7M8.5 13h5" />
  </Glyph>
);
const IconStructure = () => (
  <Glyph>
    <path d="M3 17l5-5 4 3 4-7 5 4" />
    <path d="M3 21h18" />
  </Glyph>
);
const IconPools = () => (
  <Glyph>
    <path d="M4 8h16M4 16h16" />
    <path d="M8 5v6M16 13v6" />
  </Glyph>
);
const IconBlock = () => (
  <Glyph>
    <rect x="5" y="8" width="14" height="8" rx="1" />
    <path d="M12 3v5M12 16v5" />
  </Glyph>
);
const IconZigzag = () => (
  <Glyph>
    <path d="M3 16h5l3-9 3 13 3-8h4" />
  </Glyph>
);
const IconStar = () => (
  <Glyph>
    <path d="M12 3l2.4 5.4 5.6.6-4.2 3.9 1.2 5.6L12 15.6 6.9 18.5l1.2-5.6L4 9l5.6-.6z" />
  </Glyph>
);
const IconNotes = () => (
  <Glyph>
    <path d="M5 3h9l5 5v13H5z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 13h7M8.5 17h4" />
  </Glyph>
);

// ── Boîte à outils ──
const IconPerson = () => (
  <Glyph>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </Glyph>
);
const IconDivergence = () => (
  <Glyph>
    <path d="M3 12h4l3-7 4 14 3-7h4" />
  </Glyph>
);
const IconEma = () => (
  <Glyph>
    <path d="M3 16c5 0 5-8 9-8s7 5 9 5" />
    <path d="M3 20h18" />
  </Glyph>
);
const IconVolume = () => (
  <Glyph>
    <rect x="4" y="6" width="16" height="5" rx="1" />
    <rect x="4" y="14" width="10" height="4" rx="1" />
  </Glyph>
);
// Repli générique pour un script non reconnu par mot-clé (scriptIcon()).
const IconChart = () => (
  <Glyph>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16v-4M12 16V9M16 16v-7" />
  </Glyph>
);

export const ICONS = {
  flow: IconFlow,
  foot: IconFoot,
  candles: IconCandles,
  gamma: IconGamma,
  indicator: IconIndicator,
  orderbook: IconOrderBook,
  bars: IconBars,
  footanatomy: IconFootAnatomy,
  book: IconBook,
  structure: IconStructure,
  pools: IconPools,
  block: IconBlock,
  zigzag: IconZigzag,
  star: IconStar,
  notes: IconNotes,
  person: IconPerson,
  divergence: IconDivergence,
  ema: IconEma,
  volume: IconVolume,
  chart: IconChart,
};

export function Icon({ name }) {
  const Cmp = ICONS[name] || IconChart;
  return <Cmp />;
}

// ── Identité de marque (en-tête, non thématisables par --ac) ──
export function IconMark() {
  return (
    <svg className="mark" viewBox="0 0 100 100" aria-hidden="true">
      <g stroke="var(--gold)" strokeWidth="6" fill="none">
        <line x1="50" y1="50" x2="50" y2="16" />
        <line x1="50" y1="50" x2="79" y2="33" />
        <line x1="50" y1="50" x2="79" y2="67" />
        <line x1="50" y1="50" x2="50" y2="84" />
        <line x1="50" y1="50" x2="21" y2="67" />
        <line x1="50" y1="50" x2="21" y2="33" />
      </g>
      <circle cx="50" cy="50" r="13" fill="var(--gold)" />
    </svg>
  );
}

export function IconTerminal() {
  return (
    <Glyph strokeWidth="2" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </Glyph>
  );
}
export const IconTradingView = IconIndicator;

export function IconXBrand() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5.3 22H2.2l7.6-8.7L1.7 2h6.8l4.7 6.2L18.9 2zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20z" />
    </svg>
  );
}

export function IconDiscordBrand() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.3 5.3a16.9 16.9 0 00-4.1-1.3l-.2.4a15.6 15.6 0 00-5.9 0l-.2-.4a16.9 16.9 0 00-4.2 1.3C2.2 9.3 1.5 13.2 1.8 17a17 17 0 005.1 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.1 12.1 0 0010.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 005.1-2.6c.4-4.4-.7-8.3-2.7-11.7zM8.7 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2z" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
