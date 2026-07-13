/**
 * GET    /api/media/:id   → récupère un média
 * DELETE /api/media/:id   → supprime un média (admin requis)
 */

const MEDIA_KEY = 'lmaaza:media';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const redis = getRedis();
      const data = await redis.get(MEDIA_KEY);
      const media = Array.isArray(data) ? data : [];
      const asset = media.find((m) => m.id === id) || null;
      if (!asset) return res.status(404).json({ error: 'Média non trouvé' });
      return res.status(200).json({ asset });
    } catch (err) {
      console.error('[api/media/:id GET]', err.message);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const token = extractBearer(req);
    const payload = token ? verifyJwt(token) : null;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    try {
      const redis = getRedis();
      const data = await redis.get(MEDIA_KEY);
      const media = Array.isArray(data) ? data : [];
      const filtered = media.filter((m) => m.id !== id);
      await redis.set(MEDIA_KEY, filtered);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[api/media/:id DELETE]', err.message);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
