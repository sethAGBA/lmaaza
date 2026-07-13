/**
 * GET  /api/media   → liste tous les médias
 * POST /api/media   → sauvegarde un média (admin requis)
 */

const MEDIA_KEY = 'lmaaza:media';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getRedis() {
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

function extractBearer(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function verifyJwt(token) {
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'lmaaza-dev-secret-change-in-production';
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      const redis = getRedis();
      const data = await redis.get(MEDIA_KEY);
      const media = Array.isArray(data) ? data : [];
      return res.status(200).json({ media });
    } catch (err) {
      console.error('[api/media GET]', err.message);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  if (req.method === 'POST') {
    const token = extractBearer(req);
    const payload = token ? verifyJwt(token) : null;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    try {
      const asset = req.body;
      if (!asset || !asset.id) {
        return res.status(400).json({ error: 'Média invalide' });
      }
      const redis = getRedis();
      const data = await redis.get(MEDIA_KEY);
      const media = Array.isArray(data) ? data : [];
      const index = media.findIndex((m) => m.id === asset.id);
      if (index >= 0) {
        media[index] = asset;
      } else {
        media.push(asset);
      }
      await redis.set(MEDIA_KEY, media);
      return res.status(200).json({ asset });
    } catch (err) {
      console.error('[api/media POST]', err.message);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
