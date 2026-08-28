import { Redis } from "@upstash/redis";

// Redis.fromEnv() lit UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
// Ces variables n'existent qu'après provisionnement de l'intégration Redis
// côté Vercel (action tableau de bord — voir HANDOFF §0.a, hors de portée
// pour un agent). Tant qu'elles sont absentes, fromEnv() ne jette pas —
// c'est le premier appel réseau qui échoue, intercepté ci-dessous.
const redis = Redis.fromEnv();

export const LEARNERS_KEY = "hub:learners";
export const LEARNERS_MIN = 25;

/**
 * @returns {Promise<number|null>} null ⇒ ne PAS rendre la ligne de preuve
 * sociale. Sous le seuil, l'absence est délibérée : "3 traders ont appris
 * quelque chose ici" dessert la page plus que le silence (cf. HANDOFF §5).
 */
export async function getLearners() {
  try {
    const n = Number(await redis.get(LEARNERS_KEY)) || 0;
    return n >= LEARNERS_MIN ? n : null;
  } catch {
    // Redis absent/indisponible : la page doit quand même rendre.
    return null;
  }
}
