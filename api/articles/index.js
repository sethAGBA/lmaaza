/**
 * GET  /api/articles   → liste tous les articles
 * POST /api/articles   → crée/met à jour un article (admin requis)
 */

let Redis;
try {
  Redis = require('@upstash/redis').Redis;
} catch (e) {
  console.error('[api/articles] Failed to load @upstash/redis:', e.message);
}

const { verifyToken, extractBearerToken, setCorsHeaders } = require('../lib/auth');

const ARTICLES_KEY = 'lmaaza:articles';

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!Redis) throw new Error('@upstash/redis module not available');
  if (!url || !token) throw new Error('Missing Redis env vars: KV_REST_API_URL / KV_REST_API_TOKEN');
  return new Redis({ url, token });
}

async function getAllArticles() {
  const data = await getRedis().get(ARTICLES_KEY);
  return Array.isArray(data) ? data : [];
}

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      const articles = await getAllArticles();
      return res.status(200).json({ articles });
    } catch (err) {
      console.error('[api/articles GET]', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        detail: err.message,
        hasRedisModule: !!Redis,
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
      });
    }
  }

  if (req.method === 'POST') {
    const token = extractBearerToken(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    try {
      const article = req.body;
      if (!article || !article.id) {
        return res.status(400).json({ error: 'Article invalide' });
      }
      const redis = getRedis();
      const articles = await getAllArticles();
      const index = articles.findIndex((a) => a.id === article.id);
      if (index >= 0) {
        articles[index] = article;
      } else {
        articles.push(article);
      }
      await redis.set(ARTICLES_KEY, articles);
      return res.status(200).json({ article });
    } catch (err) {
      console.error('[api/articles POST]', err);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
