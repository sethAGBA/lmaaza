/**
 * GET    /api/articles/:id   → récupère un article par ID ou slug
 * DELETE /api/articles/:id   → supprime un article (admin requis)
 */

const { getRedis } = require('../lib/redis');
const { verifyToken, extractBearerToken, setCorsHeaders } = require('../lib/auth');

const ARTICLES_KEY = 'lmaaza:articles';

async function getAllArticles() {
  const data = await getRedis().get(ARTICLES_KEY);
  return Array.isArray(data) ? data : [];
}

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const articles = await getAllArticles();
      const article = articles.find((a) => a.id === id || a.slug === id) || null;
      if (!article) return res.status(404).json({ error: 'Article non trouvé' });
      return res.status(200).json({ article });
    } catch (err) {
      console.error('[api/articles/:id GET]', err);
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
      const articles = await getAllArticles();
      const filtered = articles.filter((a) => a.id !== id);
      await getRedis().set(ARTICLES_KEY, filtered);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[api/articles/:id DELETE]', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
