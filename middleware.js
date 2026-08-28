import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis/cloudflare";
// Le middleware Next.js tourne en Edge Runtime par défaut (pas Node.js). Le
// point d'entrée par défaut de @upstash/redis (nodejs.mjs) référence
// process.version pour la télémétrie — inoffensif (accès protégé par un
// typeof), mais Next le signale comme incompatible Edge à la compilation.
// L'entrée "cloudflare" est le client REST générique fetch-only, sans code
// Node : elle fonctionne sur tout runtime Edge compatible Fetch (Vercel
// Edge y compris, pas seulement Cloudflare Workers — le nom vient du public
// visé par la doc Upstash, pas d'une dépendance à Cloudflare). lib/counter.js
// tourne lui dans un Server Component (runtime Node normal) : il garde
// l'import par défaut, inchangé.
//
// ⚠ Redis.fromEnv() SANS ARGUMENT échoue TOUJOURS ici, même avec les
// identifiants correctement provisionnés dans Vercel : sur cette entrée
// "cloudflare", fromEnv() lit soit un objet `env` passé explicitement (le
// modèle Cloudflare Workers, où l'environnement arrive en paramètre de la
// fonction), soit des identifiants globaux bruts que seul le runtime
// Cloudflare injecte — jamais process.env. Vercel Edge Runtime, lui,
// expose bien process.env, mais fromEnv() ne le lit jamais sur cette
// entrée : il faut donc appeler le CONSTRUCTEUR directement (agnostique
// de plateforme, simple client REST fetch) et lui passer process.env
// nous-mêmes. Bug constaté en local : les logs montraient
// "wrangler secret put" — la commande Cloudflare, jamais correcte sur
// Vercel — preuve que fromEnv() nu ne fonctionnerait jamais ici.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
const COOKIE = "hub_learner";

// Sans ce filtre, chaque passage de crawler sur /view/* se lirait comme un
// nouvel apprenant et le chiffre deviendrait fictif en quelques semaines.
const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|headless|lighthouse|curl|wget|python-requests|axios|node-fetch|monitor|uptime/i;

export async function middleware(req) {
  const res = NextResponse.next();

  if (req.cookies.get(COOKIE)) return res; // déjà compté

  // Un clic réel déclenche DEUX requêtes vers /view/[slug] : une marquée
  // Next-Router-Prefetch (déclenchée à l'intention, avant que la navigation
  // ne s'engage), puis la navigation réelle. Vérifié empiriquement (aucune
  // requête n'est émise par un simple survol/défilement sur cette route —
  // dynamique, sans loading.js) : aujourd'hui filtrer ici ne change rien au
  // comptage d'un clic réel, le garde-cookie le rendait déjà idempotent.
  // Mais si un loading.js est ajouté un jour, Next préchargerait alors le
  // contenu dynamique dès qu'un lien entre dans le viewport — sans ce
  // filtre, quiconque fait simplement défiler la page serait compté sans
  // avoir rien ouvert. Ignorer explicitement le prefetch verrouille la
  // définition ("a ouvert au moins un cours") contre cette régression future.
  if (req.headers.get("next-router-prefetch")) return res;

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return res; // bot ou UA absent

  try {
    await redis.incr("hub:learners");
  } catch {
    // Redis indisponible : ne jamais casser la page, et ne PAS poser le
    // cookie — sinon ce visiteur ne serait plus jamais recompté.
    return res;
  }

  // Le cookie n'est posé qu'APRÈS un incrément réussi (voir ci-dessus).
  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400, // ~13 mois (repère CNIL)
  });

  return res;
}

// :slug+ (un OU PLUSIEURS segments), pas :slug* (zéro ou plus) — la route
// réelle est app/view/[slug]/page.js, qui n'existe pas pour /view seul
// (404). Avec * le middleware aurait quand même incrémenté le compteur
// sur cette requête qui échoue.
export const config = { matcher: "/view/:slug+" };
