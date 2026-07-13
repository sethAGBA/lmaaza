/**
 * GET    /api/media/:id   → récupère un média
 * DELETE /api/media/:id   → supprime un média (admin requis)
 */

const { getRedis } = require('../lib/redis');
const { verifyToken, extractBearerToken, setCorsHeaders } = require('../lib/auth');

const MEDIA_KEY = 'lmaaza:media';

async function getAllMedia() {
  const data = await getRedis().get(MEDIA_KEY);
  return Array.isArray(data) ? data : [];
}

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const media = await getAllMedia();
      const asset = media.find((m) => m.id === id) || null;
      if (!asset) return res.status(404).json({ error: 'Média non trouvé' });
      return res.status(200).json({ asset });
    } catch (err) {
      console.error('[api/media/:id GET]', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'DELETE') {
    const token = extractBearerToken(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    try {
      const media = await getAllMedia();
      const filtered = media.filter((m) => m.id !== id);
      await getRedis().set(MEDIA_KEY, filtered);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[api/media/:id DELETE]', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
