"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

function newId() {
  return "cat_" + Math.random().toString(36).slice(2, 9);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = en cours de vérif
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [manifest, setManifest] = useState(null);
  const [linksDraft, setLinksDraft] = useState(null);
  const [toast, setToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadCat, setUploadCat] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const toastTimer = useRef(null);

  // Miroir synchrone du manifest : les mutations partent toujours de l'état
  // le plus récent, même en cas de clics rapides (l'état React est asynchrone).
  const manifestRef = useRef(null);
  // File de sauvegardes : les PUT partent un par un, dans l'ordre.
  const persistChain = useRef(Promise.resolve());
  const persistSeq = useRef(0);

  const applyManifest = useCallback((m) => {
    manifestRef.current = m;
    setManifest(m);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  // --- Auth ---
  const loadManifest = useCallback(async () => {
    const res = await fetch("/api/admin/manifest");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    applyManifest(data);
    setLinksDraft((prev) => prev ?? structuredClone(data.links || {}));
    setAuthed(true);
  }, [applyManifest]);

  useEffect(() => {
    loadManifest();
  }, [loadManifest]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      await loadManifest();
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginErr(data.error || "Erreur de connexion");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    applyManifest(null);
    setLinksDraft(null);
  }

  // --- Persistance (sérialisée) ---
  function persist(next) {
    applyManifest(next); // optimiste, immédiat
    const seq = ++persistSeq.current;
    persistChain.current = persistChain.current.then(async () => {
      try {
        const res = await fetch("/api/admin/manifest", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // On envoie l'état le plus récent connu au moment du départ
          body: JSON.stringify(manifestRef.current),
        });
        if (res.ok) {
          const data = await res.json();
          // On n'applique la réponse serveur que si aucune sauvegarde
          // plus récente n'a été demandée entre-temps.
          if (seq === persistSeq.current) applyManifest(data.manifest);
          showToast("✓ sauvegardé");
        } else {
          showToast("✗ erreur de sauvegarde");
          if (seq === persistSeq.current) loadManifest();
        }
      } catch {
        showToast("✗ erreur réseau");
      }
    });
    return persistChain.current;
  }

  function mutate(fn) {
    const next = structuredClone(manifestRef.current);
    fn(next);
    persist(next);
  }

  // --- Liens ---
  function saveLinks() {
    mutate((m) => {
      m.links = linksDraft;
    });
  }
  function setLink(key, value) {
    setLinksDraft((d) => ({ ...d, [key]: value }));
  }
  function setDiscord(key, value) {
    setLinksDraft((d) => ({ ...d, discord: { ...(d.discord || {}), [key]: value } }));
  }
  function setScript(i, key, value) {
    setLinksDraft((d) => {
      const scripts = [...(d.scripts || [])];
      scripts[i] = { ...scripts[i], [key]: value };
      return { ...d, scripts };
    });
  }
  function addScript() {
    setLinksDraft((d) => ({ ...d, scripts: [...(d.scripts || []), { name: "", url: "" }] }));
  }
  function removeScript(i) {
    setLinksDraft((d) => ({ ...d, scripts: (d.scripts || []).filter((_, j) => j !== i) }));
  }

  // --- Upload ---
  async function uploadFiles(fileList) {
    const files = [...fileList].filter((f) => /\.html?$/i.test(f.name));
    if (!files.length) {
      showToast("✗ fichiers .html uniquement");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    if (uploadCat) fd.append("categoryId", uploadCat);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      applyManifest(data.manifest);
      showToast(`✓ ${data.added.length} fichier(s) ajouté(s)`);
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(`✗ ${data.error || "erreur upload"}`);
    }
  }

  // --- Catégories ---
  function addCategory() {
    const name = prompt("Nom de la catégorie :");
    if (!name || !name.trim()) return;
    mutate((m) => {
      m.categories.push({ id: newId(), name: name.trim(), order: m.categories.length });
    });
  }

  function renameCategory(id) {
    const cat = manifestRef.current.categories.find((c) => c.id === id);
    const name = prompt("Nouveau nom :", cat?.name || "");
    if (!name || !name.trim()) return;
    mutate((m) => {
      m.categories.find((c) => c.id === id).name = name.trim();
    });
  }

  function deleteCategory(id) {
    const count = manifestRef.current.docs.filter((d) => d.categoryId === id).length;
    if (!confirm(`Supprimer cette catégorie ? ${count} document(s) passeront en "Sans catégorie".`)) return;
    mutate((m) => {
      m.categories = m.categories.filter((c) => c.id !== id);
      m.docs.forEach((d) => {
        if (d.categoryId === id) d.categoryId = null;
      });
    });
  }

  function moveCategory(id, dir) {
    mutate((m) => {
      const sorted = m.categories.sort((a, b) => a.order - b.order);
      sorted.forEach((c, idx) => (c.order = idx));
      const i = sorted.findIndex((c) => c.id === id);
      const j = i + dir;
      if (j < 0 || j >= sorted.length) return;
      [sorted[i].order, sorted[j].order] = [sorted[j].order, sorted[i].order];
    });
  }

  // --- Documents ---
  function docsIn(catId) {
    return manifest.docs
      .filter((d) => (d.categoryId || null) === catId)
      .sort((a, b) => a.order - b.order);
  }

  function moveDoc(slug, dir) {
    mutate((m) => {
      const doc = m.docs.find((d) => d.slug === slug);
      const siblings = m.docs
        .filter((d) => (d.categoryId || null) === (doc.categoryId || null))
        .sort((a, b) => a.order - b.order);
      siblings.forEach((d, idx) => (d.order = idx));
      const i = siblings.findIndex((d) => d.slug === slug);
      const j = i + dir;
      if (j < 0 || j >= siblings.length) return;
      [siblings[i].order, siblings[j].order] = [siblings[j].order, siblings[i].order];
    });
  }

  function setDocCategory(slug, categoryId) {
    mutate((m) => {
      const doc = m.docs.find((d) => d.slug === slug);
      doc.categoryId = categoryId || null;
      doc.order = m.docs.filter(
        (d) => d.slug !== slug && (d.categoryId || null) === (categoryId || null)
      ).length;
    });
  }

  function renameDoc(slug) {
    const doc = manifestRef.current.docs.find((d) => d.slug === slug);
    const title = prompt("Nouveau titre :", doc?.title || "");
    if (!title || !title.trim()) return;
    mutate((m) => {
      m.docs.find((d) => d.slug === slug).title = title.trim();
    });
  }

  function toggleIndicator(slug) {
    mutate((m) => {
      const doc = m.docs.find((d) => d.slug === slug);
      const ind = doc.indicator || { enabled: false, url: "" };
      doc.indicator = { ...ind, enabled: !ind.enabled };
    });
  }

  function setIndicatorUrl(slug, url) {
    mutate((m) => {
      const doc = m.docs.find((d) => d.slug === slug);
      doc.indicator = { ...(doc.indicator || { enabled: true }), url: url.trim() };
    });
  }

  async function deleteDoc(slug) {
    if (!confirm("Supprimer définitivement ce document ?")) return;
    const res = await fetch(`/api/admin/docs/${slug}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      applyManifest(data.manifest);
      showToast("✓ supprimé");
    } else {
      showToast("✗ erreur suppression");
    }
  }

  // --- Rendu ---
  if (authed === null) {
    return <div className="admin-wrap hint">// chargement…</div>;
  }

  if (!authed) {
    return (
      <div className="login-box">
        <div className="prompt">
          <span className="user">maxime@hub</span>:<span className="path">~/admin</span>$
          <span className="cursor" />
        </div>
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>Authentification</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginErr && <span className="err">{loginErr}</span>}
            <button className="btn primary" type="submit">
              Se connecter
            </button>
          </form>
        </div>
        <p className="hint" style={{ marginTop: 12 }}>
          <Link href="/">← retour à la library</Link>
        </p>
      </div>
    );
  }

  const cats = [...manifest.categories].sort((a, b) => a.order - b.order);
  const uncategorized = docsIn(null);
  const L = linksDraft || {};

  const docRowProps = {
    cats,
    onMove: moveDoc,
    onSetCat: setDocCategory,
    onRename: renameDoc,
    onDelete: deleteDoc,
    onToggleInd: toggleIndicator,
    onSetIndUrl: setIndicatorUrl,
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div>
          <div className="prompt">
            <span className="user">maxime@hub</span>:<span className="path">~/admin</span>$
            <span className="cursor" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" className="btn">
            Voir le site
          </Link>
          <button className="btn danger" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="panel">
        <h2>Uploader des .html</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
          <span className="hint">Catégorie cible :</span>
          <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}>
            <option value="">Sans catégorie</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div
          className={`dropzone ${dragOver ? "over" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            uploadFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? "// upload en cours…" : "// glisse tes .html ici, ou clique pour parcourir"}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Liens & réseaux */}
      <div className="panel">
        <h2>Liens &amp; réseaux</h2>
        <div className="links-form">
          <label>
            Profil TradingView
            <input
              type="url"
              placeholder="https://www.tradingview.com/u/…"
              value={L.tradingview || ""}
              onChange={(e) => setLink("tradingview", e.target.value)}
            />
          </label>
          <label>
            Compte X
            <input
              type="url"
              placeholder="https://x.com/…"
              value={L.x || ""}
              onChange={(e) => setLink("x", e.target.value)}
            />
          </label>

          <div className="toggle-row">
            <input
              type="checkbox"
              id="discord-toggle"
              checked={Boolean(L.discord?.enabled)}
              onChange={(e) => setDiscord("enabled", e.target.checked)}
            />
            <label htmlFor="discord-toggle" style={{ cursor: "pointer" }}>
              Discord ouvert (off = teaser &quot;en préparation&quot;)
            </label>
          </div>
          {L.discord?.enabled && (
            <label>
              Lien d&apos;invitation Discord
              <input
                type="url"
                placeholder="https://discord.gg/…"
                value={L.discord?.invite || ""}
                onChange={(e) => setDiscord("invite", e.target.value)}
              />
            </label>
          )}

          <div className="hint" style={{ marginTop: 6 }}>
            Indicateurs mis en avant (nom + lien script) :
          </div>
          {(L.scripts || []).map((s, i) => (
            <div key={i} className="script-edit-row">
              <input
                placeholder="Nom de l'indicateur"
                value={s.name}
                onChange={(e) => setScript(i, "name", e.target.value)}
              />
              <input
                type="url"
                placeholder="https://www.tradingview.com/script/…"
                value={s.url}
                onChange={(e) => setScript(i, "url", e.target.value)}
              />
              <button className="btn small danger" onClick={() => removeScript(i)}>
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn small" onClick={addScript}>
              + indicateur
            </button>
            <button className="btn primary small" onClick={saveLinks}>
              Sauvegarder les liens
            </button>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="panel">
        <h2>
          Catégories{" "}
          <button className="btn small" style={{ float: "right" }} onClick={addCategory}>
            + nouvelle
          </button>
        </h2>

        {cats.map((c) => (
          <div key={c.id} className="cat-block">
            <div className="cat-head">
              <span className="name">{c.name}</span>
              <span className="arrows">
                <button className="btn small" onClick={() => moveCategory(c.id, -1)} title="Monter">
                  ↑
                </button>
                <button className="btn small" onClick={() => moveCategory(c.id, 1)} title="Descendre">
                  ↓
                </button>
              </span>
              <button className="btn small" onClick={() => renameCategory(c.id)}>
                renommer
              </button>
              <button className="btn small danger" onClick={() => deleteCategory(c.id)}>
                suppr
              </button>
            </div>
            {docsIn(c.id).map((d) => (
              <DocRow key={d.slug} doc={d} {...docRowProps} />
            ))}
            {docsIn(c.id).length === 0 && <div className="doc-row hint">// vide</div>}
          </div>
        ))}

        <div className="cat-block">
          <div className="cat-head">
            <span className="name" style={{ color: "var(--text-dim)" }}>
              Sans catégorie
            </span>
          </div>
          {uncategorized.map((d) => (
            <DocRow key={d.slug} doc={d} {...docRowProps} />
          ))}
          {uncategorized.length === 0 && <div className="doc-row hint">// vide</div>}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function DocRow({ doc, cats, onMove, onSetCat, onRename, onDelete, onToggleInd, onSetIndUrl }) {
  const ind = doc.indicator || { enabled: false, url: "" };
  const [urlDraft, setUrlDraft] = useState(ind.url);

  useEffect(() => {
    setUrlDraft(ind.url);
  }, [ind.url]);

  return (
    <>
      <div className="doc-row">
        <span className="arrows">
          <button className="btn small" onClick={() => onMove(doc.slug, -1)} title="Monter">
            ↑
          </button>
          <button className="btn small" onClick={() => onMove(doc.slug, 1)} title="Descendre">
            ↓
          </button>
        </span>
        <span className="doc-name">{doc.title}</span>
        <select value={doc.categoryId || ""} onChange={(e) => onSetCat(doc.slug, e.target.value)}>
          <option value="">Sans catégorie</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className={`btn small ind-toggle ${ind.enabled ? "on" : ""}`}
          onClick={() => onToggleInd(doc.slug)}
          title={ind.enabled ? "Indicateur lié : activé" : "Lier un indicateur"}
        >
          {ind.enabled ? "● ind." : "○ ind."}
        </button>
        <a href={`/view/${doc.slug}`} target="_blank" rel="noreferrer" className="btn small">
          ouvrir
        </a>
        <button className="btn small" onClick={() => onRename(doc.slug)}>
          renommer
        </button>
        <button className="btn small danger" onClick={() => onDelete(doc.slug)}>
          suppr
        </button>
      </div>
      {ind.enabled && (
        <div className="ind-edit-row">
          <input
            type="url"
            placeholder="https://www.tradingview.com/script/… (lien de l'indicateur)"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <button
            className="btn small"
            disabled={urlDraft.trim() === ind.url}
            onClick={() => onSetIndUrl(doc.slug, urlDraft)}
          >
            ok
          </button>
        </div>
      )}
    </>
  );
}
