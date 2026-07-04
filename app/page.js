import Link from "next/link";
import { getManifest } from "@/lib/store";

export const revalidate = 0;

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function Home({ searchParams }) {
  const manifest = await getManifest();
  const links = manifest.links || {};
  const cats = [...manifest.categories].sort((a, b) => a.order - b.order);
  const activeCat = searchParams?.cat || null;

  const uncategorized = manifest.docs.filter((d) => !d.categoryId);
  const sections = cats.map((c) => ({
    cat: c,
    docs: manifest.docs.filter((d) => d.categoryId === c.id).sort((a, b) => a.order - b.order),
  }));
  if (uncategorized.length) {
    sections.push({
      cat: { id: "__none__", name: "Sans catégorie" },
      docs: uncategorized.sort((a, b) => a.order - b.order),
    });
  }

  const visible = activeCat ? sections.filter((s) => s.cat.id === activeCat) : sections;
  const total = manifest.docs.length;
  const xHandle = links.x ? "@" + links.x.replace(/\/+$/, "").split("/").pop() : null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="prompt">
          <span className="user">maxime@hub</span>:<span className="path">~/library</span>$
          <span className="cursor" />
        </div>
        <h1>
          THE HUB <span className="accent">LIBRARY</span>
        </h1>
        <Link href="/" className={`nav-cat ${!activeCat ? "active" : ""}`}>
          Tout <span className="nav-count">{total}</span>
        </Link>
        {sections.map((s) => (
          <Link
            key={s.cat.id}
            href={`/?cat=${encodeURIComponent(s.cat.id)}`}
            className={`nav-cat ${activeCat === s.cat.id ? "active" : ""}`}
          >
            {s.cat.name} <span className="nav-count">{s.docs.length}</span>
          </Link>
        ))}

        {(links.tradingview || links.x) && (
          <div className="ext-block">
            <div className="ext-title">// externes</div>
            {links.tradingview && (
              <a href={links.tradingview} target="_blank" rel="noreferrer" className="ext-link">
                <span className="ext-icon">TV</span> TradingView
              </a>
            )}
            {links.x && (
              <a href={links.x} target="_blank" rel="noreferrer" className="ext-link">
                <span className="ext-icon">𝕏</span> {xHandle || "X"}
              </a>
            )}
          </div>
        )}

        <div className="sidebar-footer">
          <Link href="/admin">→ admin</Link>
        </div>
      </aside>

      <main className="main">
        {links.discord?.enabled && links.discord?.invite ? (
          <a href={links.discord.invite} target="_blank" rel="noreferrer" className="discord-strip live">
            <span className="dot" /> Le Discord The Hub est ouvert — <strong>rejoindre&nbsp;→</strong>
          </a>
        ) : (
          <div className="discord-strip">
            <span className="dot idle" /> // Discord The Hub — en préparation. Ça arrive.
          </div>
        )}

        {total === 0 && (
          <p className="empty">
            // Aucun document pour l&apos;instant. Passe par l&apos;admin pour uploader tes .html.
          </p>
        )}
        {visible.map(
          (s) =>
            s.docs.length > 0 && (
              <section key={s.cat.id}>
                <h2 className="section-title">{s.cat.name}</h2>
                <div className="grid">
                  {s.docs.map((d) => (
                    <Link key={d.slug} href={`/view/${d.slug}`} className="card">
                      <div className="title">{d.title}</div>
                      <div className="meta">
                        {fmtDate(d.createdAt)} · {(d.size / 1024).toFixed(0)} Ko
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
        )}

        {!activeCat && links.scripts?.length > 0 && (
          <section>
            <h2 className="section-title">Indicateurs TradingView</h2>
            <div className="grid">
              {links.scripts.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="card script-card">
                  <div className="title">{s.name}</div>
                  <div className="meta">Pine Script · tradingview.com ↗</div>
                </a>
              ))}
              {links.tradingview && (
                <a href={links.tradingview} target="_blank" rel="noreferrer" className="card script-card more">
                  <div className="title">Tous les scripts publiés →</div>
                  <div className="meta">profil TradingView</div>
                </a>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
