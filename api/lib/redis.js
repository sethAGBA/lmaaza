/**
 * Client Redis partagé (Upstash) pour toutes les routes API.
 * Supporte les noms de variables Upstash natifs (KV_REST_API_*) 
 * et les alias UPSTASH_REDIS_REST_* pour la compatibilité.
 */

const { Redis } = require('@upstash/redis');

let _redis = null;

function getRedis() {
  if (!_redis) {
    const url =
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL;
    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Redis non configuré : KV_REST_API_URL et KV_REST_API_TOKEN sont requis.'
      );
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

module.exports = { getRedis };
