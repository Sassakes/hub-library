// Verrou des quatre langues : même jeu de clés pour chaque langue du
// dictionnaire, tagline et titre de module présents partout. Un trou ici
// afficherait `undefined` en production — exactement ce que ce script
// empêche. Usage : node scripts/check-i18n.mjs (exit 1 si un trou).
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const load = (p) => import(pathToFileURL(resolve(p)).href);
// Résolution de l'alias "@/" sans bundler : on charge les fichiers bruts.
const src = async (p) => (await import("node:fs")).readFileSync(resolve(p), "utf8");

const { LANGS } = await load("lib/i18n-constants.js");
const dictSrc = (await src("lib/i18n-dict.js")).replace(/import \{ LANG_META \} from "@\/lib\/i18n-constants";/, "const LANG_META = {};");
const taxSrc = await src("lib/taxonomy.js");
const { dict } = await import("data:text/javascript;base64," + Buffer.from(dictSrc).toString("base64"));
const tax = await import("data:text/javascript;base64," + Buffer.from(taxSrc).toString("base64"));

const errs = [];
const ref = Object.keys(dict.fr).sort().join(",");
for (const l of LANGS) {
  if (!dict[l]) { errs.push(`dict.${l} missing`); continue; }
  const keys = Object.keys(dict[l]).sort().join(",");
  if (keys !== ref) errs.push(`dict.${l} keys differ from dict.fr`);
  for (const [k, v] of Object.entries(dict[l])) if (v === "" || v == null) errs.push(`dict.${l}.${k} empty`);
}
for (const [id, t] of Object.entries(tax.TRACK_TAGLINE))
  for (const l of LANGS) if (!t[l]) errs.push(`TRACK_TAGLINE.${id}.${l} missing`);
for (const [slug, t] of Object.entries(tax.DOC_TITLE_I18N))
  for (const l of LANGS.filter((x) => x !== "fr")) if (!t[l]) errs.push(`DOC_TITLE_I18N.${slug}.${l} missing`);

// docTitle : titre automatique remplacé en FR, titre renommé à la main conservé.
const auto = tax.docTitle({ slug: "po3-amd", title: "Po3 Amd" }, "fr");
const manual = tax.docTitle({ slug: "po3-amd", title: "Mon PO3 à moi" }, "fr");
const de = tax.docTitle({ slug: "po3-amd", title: "Mon PO3 à moi" }, "de");
const unknown = tax.docTitle({ slug: "nouveau-module", title: "Nouveau module" }, "es");
if (auto !== "PO3 / AMD : le cycle") errs.push(`docTitle auto-title fr -> ${auto}`);
if (manual !== "Mon PO3 à moi") errs.push(`docTitle manual fr -> ${manual}`);
if (de !== "PO3 / AMD: der Zyklus") errs.push(`docTitle de -> ${de}`);
if (unknown !== "Nouveau module") errs.push(`docTitle unknown slug -> ${unknown}`);

if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log(`i18n OK: ${LANGS.length} languages, ${Object.keys(dict.fr).length} keys each, ` +
  `${Object.keys(tax.DOC_TITLE_I18N).length} module titles, ${Object.keys(tax.TRACK_TAGLINE).length} taglines`);
