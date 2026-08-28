import { NextResponse } from "next/server";
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
import { Redis } from "@upstash/redis/cloudflare";

// Incrémente le compteur d'apprenants à la PREMIÈRE ouverture de cours d'un
// navigateur. Vit en middleware, pas dans la page : un Server Component
// peut LIRE un cookie au rendu mais pas en POSER un — contrainte Next.js,
// pas un choix. Bonus : aucun JS client, donc aucun bloqueur de pub ne
// peut le supprimer, et ça fonctionne JS désactivé. Voir HANDOFF §5.
const redis = Redis.fromEnv();
const COOKIE = "hub_learner";

// Sans ce filtre, chaque passage de crawler sur /view/* se lirait comme un
// nouvel apprenant et le chiffre deviendrait fictif en quelques semaines.
const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|headless|lighthouse|curl|wget|python-requests|axios|node-fetch|monitor|uptime/i;

export async function middleware(req) {
  const res = NextResponse.next();

  if (req.cookies.get(COOKIE)) return res; // déjà compté

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

export const config = { matcher: "/view/:slug*" };
