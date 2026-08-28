// Réglages partagés du client Redis (compteur d'apprenants).
//
// ⚠ POURQUOI CE FICHIER EXISTE — incident mesuré en production :
// le compteur bloquait CHAQUE rendu de page pendant ~4,3 s. Cause : la
// politique de retry par défaut de @upstash/redis, soit 5 tentatives avec
// un backoff Math.exp(n)*50 ms — 4 240 ms d'attente cumulée avant
// d'abandonner. Tant que Redis n'est pas provisionné (ou indisponible),
// chaque requête payait ce prix. Mesuré : 4,59 s avec UA navigateur contre
// 0,28 s avec UA bot (le filtre bot court-circuitait Redis avant l'appel).
//
// Le compteur est une statistique d'ornement : il ne doit JAMAIS retarder
// un rendu. Trois garde-fous, du moins cher au plus cher :
//   1. isConfigured() — sans variables d'env, on ne construit même pas de
//      client et on ne tente aucun appel réseau. Coût zéro.
//   2. retry:false — échec immédiat au lieu de 5 tentatives à backoff
//      exponentiel. (Le SDK traduit `false` en attempts:1, backoff:0.)
//   3. signal — plafond dur, même Redis provisionné : un store lent ne
//      doit pas retenir la page derrière lui.
export const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
export const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(REDIS_URL && REDIS_TOKEN);

// Plafond de latence acceptable pour le compteur. Volontairement court :
// au-delà, mieux vaut une page sans la ligne de preuve sociale qu'une page
// qui se fait attendre.
const TIMEOUT_MS = 700;

// Le SDK accepte une FONCTION pour `signal` et l'appelle à chaque requête —
// indispensable ici : un AbortSignal statique serait consommé au premier
// timeout et ferait échouer toutes les requêtes suivantes.
function timeoutSignal() {
  try {
    return AbortSignal.timeout(TIMEOUT_MS);
  } catch {
    // AbortSignal.timeout indisponible sur le runtime : pas de plafond,
    // mais retry:false borne déjà le pire cas à un aller-retour.
    return undefined;
  }
}

export const redisOptions = {
  url: REDIS_URL,
  token: REDIS_TOKEN,
  retry: false,
  signal: timeoutSignal,
};
