/**
 * GET  /api/media   → liste tous les médias
 * POST /api/media   → sauvegarde un média (admin requis)
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

  if (req.method === 'GET') {
    try {
      const media = await getAllMedia();
      return res.status(200).json({ media });
    } catch (err) {
      console.error('[api/media GET]', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    const token = extractBearerToken(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    try {
      const asset = req.body;
      if (!asset || !asset.id) {
        return res.status(400).json({ error: 'Média invalide' });
      }
      const media = await getAllMedia();
      const index = media.findIndex((m) => m.id === asset.id);
      if (index >= 0) {
        media[index] = asset;
      } else {
        media.push(asset);
      }
      await getRedis().set(MEDIA_KEY, media);
      return res.status(200).json({ asset });
    } catch (err) {
      console.error('[api/media POST]', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
