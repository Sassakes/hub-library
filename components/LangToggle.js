"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGS, LANG_COOKIE, LANG_META } from "@/lib/i18n-constants";

// Sélecteur de langue — même boîtier et même comportement que celui du
// terminal (shell.js, shellLangRender) : le bouton ne montre que la langue
// courante et ouvre la liste au clic. Quatre boutons côte à côte auraient
// élargi le groupe [communauté][langue] au point de faire passer l'en-tête
// sur deux rangées sur mobile.
//
// Le choix pose le cookie puis force un nouveau rendu SERVEUR
// (router.refresh(), pas de state de langue côté client) : le HTML renvoyé
// est déjà dans la bonne langue — pas de flash. Les modules (même origine)
// lisent ce même cookie au chargement : un choix fait ici les suit.
export default function LangToggle({ lang, label = "Language" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const itemRefs = useRef([]);

  function setLang(l) {
    setOpen(false);
    btnRef.current?.focus();
    if (l === lang) return;
    // Portée sur .gexdash.app (domaine parent) : partagée avec le terminal.
    // Sur localhost/preview Vercel, .gexdash.app n'est pas un domaine valide
    // pour ce host — le navigateur rejetterait silencieusement le cookie,
    // donc on omet l'attribut Domain hors prod. Comparaison EXACTE ou
    // sous-domaine (pas endsWith("gexdash.app") nu, qui matcherait aussi un
    // hôte non apparenté comme "notgexdash.app").
    const host = window.location.hostname;
    const onGexdash = host === "gexdash.app" || host.endsWith(".gexdash.app");
    const domainAttr = onGexdash ? "; domain=.gexdash.app" : "";
    const secureAttr = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}${domainAttr}; samesite=lax${secureAttr}`;
    router.refresh();
  }

  // Focus sur la langue courante à l'ouverture (comme shellLangOpen).
  useEffect(() => {
    if (!open) return;
    itemRefs.current[Math.max(0, LANGS.indexOf(lang))]?.focus();
  }, [open, lang]);

  // Clic hors du sélecteur / Échap : fermeture.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onItemKey(e, i) {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
      e.preventDefault();
      const n =
        k === "Home" ? 0 : k === "End" ? LANGS.length - 1 : (i + (k === "ArrowDown" ? 1 : -1) + LANGS.length) % LANGS.length;
      itemRefs.current[n]?.focus();
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      setLang(LANGS[i]);
    } else if (k === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="appLang" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className="appLang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} · ${LANG_META[lang].name}`}
        title={LANG_META[lang].name}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="code">{lang.toUpperCase()}</span>
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>
      <ul className="appLang-menu" role="listbox" aria-label={label} hidden={!open}>
        {LANGS.map((l, i) => (
          <li
            key={l}
            ref={(el) => (itemRefs.current[i] = el)}
            role="option"
            tabIndex={-1}
            data-l={l}
            lang={l}
            aria-selected={l === lang}
            onClick={(e) => {
              e.stopPropagation();
              setLang(l);
            }}
            onKeyDown={(e) => onItemKey(e, i)}
          >
            <span className="code">{l.toUpperCase()}</span>
            <span className="name">{LANG_META[l].name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
