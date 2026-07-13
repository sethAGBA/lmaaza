/**
 * GET  /api/articles   → liste tous les articles
 * POST /api/articles   → crée/met à jour un article (admin requis)
 */

const ARTICLES_KEY = 'lmaaza:articles';

// ── Articles de migration par défaut ─────────────────────────────────────────
// Ces articles sont chargés si Redis est vide (premier accès en production).
const DEFAULT_ARTICLES = [
  {
    id: '00000001-0000-4000-8000-000000000001',
    title: "L'Innovation Technologique au Service de l'Agriculture Togolaise",
    excerpt: "Découvrez comment les technologies modernes transforment l'agriculture traditionnelle au Togo et créent de nouvelles opportunités pour les agriculteurs locaux.",
    content: `L'agriculture au Togo est à un tournant. Grâce à l'introduction de capteurs simples, d'applications mobiles et de solutions de monitoring, les petits exploitants peuvent aujourd'hui mieux gérer l'eau, optimiser les semis et améliorer les rendements.\n\nDans cet article, nous présentons des cas concrets issus de nos projets pilotes : installation de capteurs d'humidité, formation des agriculteurs à l'utilisation d'applications de prévision météorologique, et déploiement de systèmes d'irrigation intelligents adaptés aux petites exploitations.\n\nCes interventions montrent que la technologie, quand elle est pensée pour le contexte local, devient un levier puissant pour la sécurité alimentaire et la résilience des communautés rurales.`,
    category: 'Agriculture', tags: [], featuredImage: null,
    author: 'BEBINESSO Toi Bebezseky', readTime: 5,
    slug: 'linnovation-technologique-au-service-de-lagriculture-togolaise',
    status: 'published',
    createdAt: '2024-12-15T00:00:00.000Z', updatedAt: '2024-12-15T00:00:00.000Z', publishedAt: '2024-12-15T00:00:00.000Z',
    seoMetadata: { title: null, description: "Découvrez comment les technologies modernes transforment l'agriculture traditionnelle au Togo.", keywords: [], canonicalUrl: 'https://lmaaza.net/blog/linnovation-technologique-au-service-de-lagriculture-togolaise', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
  },
  {
    id: '00000001-0000-4000-8000-000000000002',
    title: "Formation Arduino : Démystifier l'Électronique pour les Jeunes",
    excerpt: "Retour sur notre formation Arduino organisée avec Tilitu Lab et son impact sur l'éveil technologique des participants.",
    content: `La formation Arduino que nous avons tenue avec Tilitu Lab visait à initier les jeunes aux bases de l'électronique et de la programmation. En moins d'une semaine, les participants ont réalisé des prototypes simples : capteurs lumineux, systèmes d'alerte et petits robots.\n\nL'approche pratique et ludique a permis de lever les peurs autour de l'électronique. De nombreux jeunes ont exprimé leur désir de poursuivre l'apprentissage et de participer à des projets de fabrication numérique.\n\nNous pensons que l'apprentissage par la pratique est la clé pour susciter des vocations et fournir des compétences utiles pour l'emploi local.`,
    category: 'Formation', tags: [], featuredImage: null,
    author: 'TETE MAWUSSI KOSSI FELIX', readTime: 4,
    slug: 'formation-arduino-demystifier-lelectronique-pour-les-jeunes',
    status: 'published',
    createdAt: '2024-12-10T00:00:00.000Z', updatedAt: '2024-12-10T00:00:00.000Z', publishedAt: '2024-12-10T00:00:00.000Z',
    seoMetadata: { title: null, description: "Retour sur notre formation Arduino organisée avec Tilitu Lab.", keywords: [], canonicalUrl: 'https://lmaaza.net/blog/formation-arduino-demystifier-lelectronique-pour-les-jeunes', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
  },
  {
    id: '00000001-0000-4000-8000-000000000003',
    title: 'Le Serveur Automatique : Innovation et Tradition Réunies',
    excerpt: "Comment notre serveur automatique de boissons locales préserve les traditions tout en apportant l'innovation technologique.",
    content: `Le serveur automatique de boissons locales est un projet qui combine savoir-faire traditionnel et technologie locale. Il garantit l'hygiène, la disponibilité et une expérience utilisateur moderne tout en valorisant des recettes locales.\n\nNous avons travaillé avec des artisans et des entrepreneurs pour concevoir une machine simple à utiliser, facile à maintenir et adaptable à différentes boissons locales.\n\nLe projet illustre notre philosophie : innover en respectant et en mettant en valeur les traditions locales.`,
    category: 'Innovation', tags: [], featuredImage: null,
    author: "L'Maaza Team", readTime: 6,
    slug: 'le-serveur-automatique-innovation-et-tradition-reunies',
    status: 'published',
    createdAt: '2024-12-05T00:00:00.000Z', updatedAt: '2024-12-05T00:00:00.000Z', publishedAt: '2024-12-05T00:00:00.000Z',
    seoMetadata: { title: null, description: "Comment notre serveur automatique de boissons locales préserve les traditions.", keywords: [], canonicalUrl: 'https://lmaaza.net/blog/le-serveur-automatique-innovation-et-tradition-reunies', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
  },
  {
    id: '00000001-0000-4000-8000-000000000004',
    title: "L'Importance de l'Éducation Technologique pour les Filles",
    excerpt: "Pourquoi il est crucial d'encourager les jeunes filles à s'orienter vers les filières technologiques et comment y parvenir.",
    content: `Encourager les filles vers les études technologiques est un enjeu majeur pour l'égalité des chances et le développement. Les barrières culturelles et le manque d'exemples restent des freins importants.\n\nDans cet article, nous partageons des retours d'expérience de mentors, des témoignages de jeunes filles formées et des recommandations pour les écoles et les décideurs.\n\nInvestir dans l'éducation technologique des filles, c'est investir dans un avenir plus inclusif et innovant.`,
    category: 'Éducation', tags: [], featuredImage: null,
    author: 'DADJA Massamasso Clarisse', readTime: 7,
    slug: 'limportance-de-leducation-technologique-pour-les-filles',
    status: 'published',
    createdAt: '2024-12-01T00:00:00.000Z', updatedAt: '2024-12-01T00:00:00.000Z', publishedAt: '2024-12-01T00:00:00.000Z',
    seoMetadata: { title: null, description: "Pourquoi encourager les jeunes filles vers les filières technologiques.", keywords: [], canonicalUrl: 'https://lmaaza.net/blog/limportance-de-leducation-technologique-pour-les-filles', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
  },
];

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
      const data = await redis.get(ARTICLES_KEY);
      let articles = Array.isArray(data) ? data : [];

      // Premier accès : persister les articles par défaut dans Redis
      if (articles.length === 0) {
        articles = DEFAULT_ARTICLES;
        await redis.set(ARTICLES_KEY, articles);
      }

      return res.status(200).json({ articles });
    } catch (err) {
      console.error('[api/articles GET]', err.message);
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
      const article = req.body;
      if (!article || !article.id) {
        return res.status(400).json({ error: 'Article invalide' });
      }
      const redis = getRedis();
      const data = await redis.get(ARTICLES_KEY);
      const articles = Array.isArray(data) ? data : [];
      const index = articles.findIndex((a) => a.id === article.id);
      if (index >= 0) {
        articles[index] = article;
      } else {
        articles.push(article);
      }
      await redis.set(ARTICLES_KEY, articles);
      return res.status(200).json({ article });
    } catch (err) {
      console.error('[api/articles POST]', err.message);
      return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
