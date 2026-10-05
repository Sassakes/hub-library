import Link from "next/link";
import { getManifestCached } from "@/lib/store";
import { isAuthenticated } from "@/lib/session";
import { getLang, dict, fmtDate, fmtSize } from "@/lib/i18n";
import { getLearners, LEARNERS_MIN } from "@/lib/counter";
import {
  isAnnex,
  isCapstone,
  TRACK_ACCENT,
  TRACK_ICON,
  TRACK_TAGLINE,
  DOC_ICON,
  COMING_SOON,
  scriptIcon,
  buildTrackSlots,
  docTitle,
} from "@/lib/taxonomy";
import { Icon, IconMark, IconTerminal, IconTradingView, IconXBrand, IconDiscordBrand } from "@/components/icons";
import LangToggle from "@/components/LangToggle";

export const revalidate = 0;

function ModuleCard({ doc, num, lang, t }) {
  const capstone = isCapstone(doc);
  const icon = DOC_ICON[doc.slug] || "chart";
  return (
    <Link href={`/view/${doc.slug}`} className={`card${capstone ? " cap" : ""}`}>
      <div className="ghost">{num}</div>
      <div className="crow">
        <div className="thumb">
          <Icon name={icon} />
        </div>
        {capstone ? (
          <span className="tag cap">capstone</span>
        ) : (
          <span className="num">
            {t.moduleLabel} {num}
          </span>
        )}
        {!capstone && doc.indicator?.enabled && doc.indicator?.url && (
          <span className="linked" title={t.indicatorTag}>
            <Icon name="indicator" />
          </span>
        )}
      </div>
      <div className="t">{docTitle(doc, lang)}</div>
      <div className="foot">
        <span>
          {fmtDate(doc.createdAt, lang)} · {fmtSize(doc.size, lang)}
        </span>
        <span className="go">→</span>
      </div>
    </Link>
  );
}

function SoonCard({ entry, num, lang, t }) {
  return (
    <div className="card soon">
      <div className="ghost">{num}</div>
      <div className="crow">
        <div className="thumb">
          <Icon name={entry.icon} />
        </div>
        <span className="num">
          {t.moduleLabel} {num} · {t.soonSuffix}
        </span>
      </div>
      <div className="t">{entry[lang] || entry.en || entry.fr}</div>
      <div className="foot">
        <span>{t.soonNote}</span>
      </div>
    </div>
  );
}

function AnnexCard({ doc, lang, t }) {
  const icon = DOC_ICON[doc.slug] || "notes";
  const tag = doc.indicator?.enabled ? t.indicatorTag : t.referenceTag;
  return (
    <Link href={`/view/${doc.slug}`} className="card annex">
      <div className="crow">
        <div className="thumb">
          <Icon name={icon} />
        </div>
        <span className="tag">{tag}</span>
      </div>
      <div className="t">{docTitle(doc, lang)}</div>
      <div className="foot">
        <span>
          {fmtDate(doc.createdAt, lang)} · {fmtSize(doc.size, lang)}
        </span>
        <span className="go">↗</span>
      </div>
    </Link>
  );
}

function TrackSection({ idx, cat, modules, annexes, soon, lang, t }) {
  const accent = TRACK_ACCENT[cat.id] || "p-gex";
  const icon = TRACK_ICON[cat.id] || "chart";
  const tagline = TRACK_TAGLINE[cat.id]?.[lang];
  const slots = buildTrackSlots(modules, soon);
  const trackNum = String(idx + 1).padStart(2, "0");

  const countWord = annexes.length
    ? `${annexes.length} ${t.annexesWord}`
    : soon.length
    ? `${soon.length} ${t.comingWord}`
    : null;
  const sub = [
    `${t.trackWord} ${trackNum}`,
    tagline,
    `${modules.length} ${t.modulesWord}`,
    countWord,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={`sec ${accent}`} id={`s-${cat.id}`}>
      <div className="sechead">
        <div className="secglyph">
          <Icon name={icon} />
        </div>
        <div className="sectext">
          <h3>{cat.name}</h3>
          <div className="sub">{sub}</div>
        </div>
        <div className="rule" />
      </div>

      <div className="grid">
        {slots.map((slot) =>
          slot.type === "soon" ? (
            <SoonCard key={`soon-${cat.id}-${slot.num}`} entry={slot.data} num={slot.num} lang={lang} t={t} />
          ) : (
            <ModuleCard key={slot.data.slug} doc={slot.data} num={slot.num} lang={lang} t={t} />
          )
        )}
      </div>

      {annexes.length > 0 && (
        <>
          <div className="annexhead">
            <span>{t.appendicesLabel}</span>
            <div className="rule" />
          </div>
          <div className="grid">
            {annexes.map((doc) => (
              <AnnexCard key={doc.slug} doc={doc} lang={lang} t={t} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default async function Home({ searchParams }) {
  const [manifest, learners] = await Promise.all([getManifestCached(), getLearners()]);
  const lang = getLang();
  const t = dict[lang];
  // isAuthenticated() est désormais appelée sur la page PUBLIQUE (avant P6,
  // seul /admin l'utilisait). verify() ne touche SESSION_SECRET que si un
  // cookie hub_session est présent — donc inatteignable pour l'immense
  // majorité des visiteurs — mais un visiteur déjà connecté qui atterrit
  // ici pendant que SESSION_SECRET est mal configuré (ex. déploiement
  // preview sans toutes les env vars) ferait planter la page d'accueil
  // entière au lieu de simplement ne pas voir le lien admin. Échec fermé :
  // en cas de doute, pas de lien admin, jamais de 500 public.
  let isAuth = false;
  try {
    isAuth = isAuthenticated();
  } catch {
    isAuth = false;
  }

  const links = manifest.links || {};
  const cats = [...manifest.categories].sort((a, b) => a.order - b.order);
  const activeCat = searchParams?.cat || null;

  const uncategorized = manifest.docs.filter((d) => !d.categoryId);

  const tracks = cats.map((c, idx) => {
    const all = manifest.docs.filter((d) => d.categoryId === c.id).sort((a, b) => a.order - b.order);
    return {
      idx,
      cat: c,
      modules: all.filter((d) => !isAnnex(d)),
      annexes: all.filter((d) => isAnnex(d)),
      soon: COMING_SOON[c.id] || [],
    };
  });
  if (uncategorized.length) {
    tracks.push({
      idx: tracks.length,
      cat: { id: "__none__", name: t.uncategorized },
      modules: uncategorized.sort((a, b) => a.order - b.order),
      annexes: [],
      soon: [],
    });
  }

  const visibleTracks = activeCat ? tracks.filter((s) => s.cat.id === activeCat) : tracks;
  const total = manifest.docs.length;
  const scriptCount = links.scripts?.length || 0;
  const indicatorCount = scriptCount + manifest.docs.filter((d) => d.indicator?.enabled).length;
  const showProof = learners !== null; // sous LEARNERS_MIN → learners est null, ligne absente du DOM

  return (
    <>
      <header>
        <div className="brandblock">
          <IconMark />
          <div className="brand">
            <h1>
              <b>Gex</b>Dash<span> · </span>
              <span className="pg">The Hub</span>
            </h1>
          </div>
        </div>

        <div className="spacer" />

        <nav className="community">
          <a className="clink primary" href="https://dash.gexdash.app">
            <span className="ic">
              <IconTerminal />
            </span>
            <span className="lbl">{t.terminal}</span>
          </a>
          {links.tradingview && (
            <>
              <div className="csep" />
              <a className="clink" href={links.tradingview} target="_blank" rel="noreferrer">
                <span className="ic">
                  <IconTradingView />
                </span>
                <span className="lbl">{t.tradingview}</span>
              </a>
            </>
          )}
          <div className="csep" />
          <a className="clink" href="https://x.com/gexdash" target="_blank" rel="noreferrer">
            <span className="ic">
              <IconXBrand />
            </span>
            <span className="lbl">@gexdash</span>
          </a>
          <div className="csep" />
          <a className="clink" href="https://discord.gg/WCxEsGWCb" target="_blank" rel="noreferrer">
            <span className="ic">
              <IconDiscordBrand />
            </span>
            <span className="lbl">{t.discord}</span>
          </a>
          <div className="csep" />
          <LangToggle lang={lang} label={t.langLabel} />
          {isAuth && (
            <>
              <div className="csep" />
              <Link href="/admin" className="clink">
                <span className="lbl">{t.admin}</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      <div className="hero">
        <div className="heroin">
          <div className="eyebrow">
            <span className="pulse" />
            <span>{t.heroEyebrow}</span>
          </div>

          <h2 dangerouslySetInnerHTML={{ __html: t.heroHeadlineHtml }} />

          <p>{t.heroBody}</p>

          <div className="stats">
            <div className="stat">
              <div className="v">{total}</div>
              <div className="k">{t.statModules}</div>
            </div>
            <div className="stat">
              <div className="v">{cats.length}</div>
              <div className="k">{t.statTracks}</div>
            </div>
            <div className="stat">
              <div className="v">{indicatorCount}</div>
              <div className="k">{t.statIndicators}</div>
            </div>
          </div>

          {showProof && (
            <div className="proof">
              <span className="livedot" />
              <span>
                <b>{learners}</b> {t.proofSuffix}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="filterbar">
        <div className="filterin">
          <div className="seg">
            <Link href="/" className={!activeCat ? "on" : ""}>
              <span>{t.all}</span> <span className="n">{total}</span>
            </Link>
            {tracks.map((s) => (
              <Link
                key={s.cat.id}
                href={`/?cat=${encodeURIComponent(s.cat.id)}`}
                className={`${TRACK_ACCENT[s.cat.id] || ""} ${activeCat === s.cat.id ? "on" : ""}`}
              >
                <span className="pip" />
                {s.cat.name} <span className="n">{s.modules.length + s.annexes.length}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main>
        {total === 0 && <p className="empty">{t.empty}</p>}

        {visibleTracks.map(
          (s) =>
            (s.modules.length > 0 || s.annexes.length > 0 || s.soon.length > 0) && (
              <TrackSection
                key={s.cat.id}
                idx={s.idx}
                cat={s.cat}
                modules={s.modules}
                annexes={s.annexes}
                soon={s.soon}
                lang={lang}
                t={t}
              />
            )
        )}

        {!activeCat && scriptCount > 0 && (
          <section className="sec p-gex">
            <div className="sechead">
              <div className="secglyph">
                <Icon name="indicator" />
              </div>
              <div className="sectext">
                <h3>{t.toolbeltTitle}</h3>
                <div className="sub">{t.toolbeltSub}</div>
              </div>
              <div className="rule" />
            </div>

            <div className="toolbelt">
              <div className="tb-head">
                <div className="tb-id">
                  <div className="tb-av">
                    <Icon name="person" />
                  </div>
                  <div>
                    <h4>@datanalyste</h4>
                    <div className="sub">{t.toolbeltScripts(scriptCount)}</div>
                  </div>
                </div>
                {links.tradingview && (
                  <a className="tb-cta" href={links.tradingview} target="_blank" rel="noreferrer">
                    <span>{t.viewProfile}</span> ↗
                  </a>
                )}
              </div>

              {links.scripts.map((s) => (
                <a key={s.url} className="tb-row" href={s.url} target="_blank" rel="noreferrer">
                  <span className="tb-ic">
                    <Icon name={scriptIcon(s.name)} />
                  </span>
                  <span className="tb-name">{s.name}</span>
                  <span className="tag">{t.pineTag}</span>
                  <span className="tb-go">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>{t.footerBrand}</span>
        <span>·</span>
        <a href="https://dash.gexdash.app">GexDash Terminal ↗</a>
        <span>·</span>
        <a href="https://x.com/gexdash">@gexdash ↗</a>
      </footer>
    </>
  );
}
