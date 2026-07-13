/**
 * Client Redis partagé (Upstash) pour toutes les routes API.
 */

const { Redis } = require('@upstash/redis');

let _redis = null;

function getRedis() {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

module.exports = { getRedis };
