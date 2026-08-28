import { Redis } from "@upstash/redis";
import { isRedisConfigured, redisOptions } from "@/lib/redis-config";

// Client construit UNIQUEMENT si les variables d'env existent. Sans elles,
// `redis` reste null et getLearners() rend la main sans toucher au réseau —
// voir lib/redis-config.js pour la mesure qui a motivé ce garde-fou.
const redis = isRedisConfigured ? new Redis(redisOptions) : null;

export const LEARNERS_KEY = "hub:learners";
export const LEARNERS_MIN = 25;

/**
 * @returns {Promise<number|null>} null ⇒ ne PAS rendre la ligne de preuve
 * sociale. Sous le seuil, l'absence est délibérée : "3 traders ont appris
 * quelque chose ici" dessert la page plus que le silence (cf. HANDOFF §5).
 * null aussi si Redis est absent, lent ou en erreur : le compteur ne doit
 * jamais être une raison d'attendre.
 */
export async function getLearners() {
  if (!redis) return null;
  try {
    const n = Number(await redis.get(LEARNERS_KEY)) || 0;
    return n >= LEARNERS_MIN ? n : null;
  } catch {
    return null;
  }
}
