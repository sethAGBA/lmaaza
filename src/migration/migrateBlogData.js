/**
 * Migration script: converts static blogPosts from src/data.js
 * to the new Article schema used by the dynamic blog system.
 *
 * Requirements: 10.2, 10.3, 10.4, 10.5
 *
 * Usage as a module:
 *   import { migrateArticles, generateSlug } from './migrateBlogData.js';
 *
 * Usage from Node CLI (requires --experimental-vm-modules or a bundler step):
 *   node scripts/migrateBlogData.js [output.json]
 */

// ---------------------------------------------------------------------------
// Inline copy of the raw blogPosts data from src/data.js.
// data.js contains JSX (Lucide React icons) so it cannot be loaded directly
// in a plain Node process. Tests run under Jest/Babel and can import it fine;
// for CLI use we keep a dependency-free copy of just the blogPosts array here.
// ---------------------------------------------------------------------------
const LEGACY_BLOG_POSTS = [
  {
    id: 1,
    title: "L'Innovation Technologique au Service de l'Agriculture Togolaise",
    excerpt:
      'Découvrez comment les technologies modernes transforment l\'agriculture traditionnelle au Togo et créent de nouvelles opportunités pour les agriculteurs locaux.',
    author: 'BEBINESSO Toi Bebezseky',
    date: '15 Décembre 2024',
    category: 'Agriculture',
    readTime: '5 min',
    image: '🌾',
    content: `L'agriculture au Togo est à un tournant. Grâce à l'introduction de capteurs simples, d'applications mobiles et de solutions de monitoring, les petits exploitants peuvent aujourd'hui mieux gérer l'eau, optimiser les semis et améliorer les rendements.

  Dans cet article, nous présentons des cas concrets issus de nos projets pilotes : installation de capteurs d'humidité, formation des agriculteurs à l'utilisation d'applications de prévision météorologique, et déploiement de systèmes d'irrigation intelligents adaptés aux petites exploitations.

  Ces interventions montrent que la technologie, quand elle est pensée pour le contexte local, devient un levier puissant pour la sécurité alimentaire et la résilience des communautés rurales.`,
  },
  {
    id: 2,
    title: "Formation Arduino : Démystifier l'Électronique pour les Jeunes",
    excerpt:
      "Retour sur notre formation Arduino organisée avec Tilitu Lab et son impact sur l'éveil technologique des participants.",
    author: 'TETE MAWUSSI KOSSI FELIX',
    date: '10 Décembre 2024',
    category: 'Formation',
    readTime: '4 min',
    image: '🔧',
    content: `La formation Arduino que nous avons tenue avec Tilitu Lab visait à initier les jeunes aux bases de l'électronique et de la programmation. En moins d'une semaine, les participants ont réalisé des prototypes simples : capteurs lumineux, systèmes d'alerte et petits robots.

  L'approche pratique et ludique a permis de lever les peurs autour de l'électronique. De nombreux jeunes ont exprimé leur désir de poursuivre l'apprentissage et de participer à des projets de fabrication numérique.

  Nous pensons que l'apprentissage par la pratique est la clé pour susciter des vocations et fournir des compétences utiles pour l'emploi local.`,
  },
  {
    id: 3,
    title: 'Le Serveur Automatique : Innovation et Tradition Réunies',
    excerpt:
      'Comment notre serveur automatique de boissons locales préserve les traditions tout en apportant l\'innovation technologique.',
    author: "L'Maaza Team",
    date: '5 Décembre 2024',
    category: 'Innovation',
    readTime: '6 min',
    image: '🤖',
    content: `Le serveur automatique de boissons locales est un projet qui combine savoir-faire traditionnel et technologie locale. Il garantit l'hygiène, la disponibilité et une expérience utilisateur moderne tout en valorisant des recettes locales.

  Nous avons travaillé avec des artisans et des entrepreneurs pour concevoir une machine simple à utiliser, facile à maintenir et adaptable à différentes boissons locales. Le résultat : une solution qui aide à professionnaliser la vente ambulante et à créer des revenus supplémentaires.

  Le projet illustre notre philosophie : innover en respectant et en mettant en valeur les traditions locales.`,
  },
  {
    id: 4,
    title: "L'Importance de l'Éducation Technologique pour les Filles",
    excerpt:
      "Pourquoi il est crucial d'encourager les jeunes filles à s'orienter vers les filières technologiques et comment y parvenir.",
    author: 'DADJA Massamasso Clarisse',
    date: '1 Décembre 2024',
    category: 'Éducation',
    readTime: '7 min',
    image: '👩‍💻',
    content: `Encourager les filles vers les études technologiques est un enjeu majeur pour l'égalité des chances et le développement. Les barrières culturelles et le manque d'exemples restent des freins importants.

  Dans cet article, nous partageons des retours d'expérience de mentors, des témoignages de jeunes filles formées et des recommandations pour les écoles et les décideurs : renforcer les programmes pratiques, former des enseignantes et créer des espaces sûrs pour l'expérimentation.

  Investir dans l'éducation technologique des filles, c'est investir dans un avenir plus inclusif et innovant.`,
  },
];

// ---------------------------------------------------------------------------
// French month names for parsing legacy date strings (e.g. "15 Décembre 2024")
// ---------------------------------------------------------------------------
const FRENCH_MONTHS = {
  Janvier: '01',
  Février: '02',
  Mars: '03',
  Avril: '04',
  Mai: '05',
  Juin: '06',
  Juillet: '07',
  Août: '08',
  Septembre: '09',
  Octobre: '10',
  Novembre: '11',
  Décembre: '12',
};

/**
 * Parse a French date string like "15 Décembre 2024" into an ISO 8601 string.
 * Falls back to the current date if parsing fails.
 *
 * @param {string} dateStr - French date string
 * @returns {string} ISO 8601 date string
 */
function parseLegacyDate(dateStr) {
  if (!dateStr) return new Date().toISOString();

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const [day, monthName, year] = parts;
    const month = FRENCH_MONTHS[monthName];
    if (month) {
      const dayPadded = day.padStart(2, '0');
      const iso = `${year}-${month}-${dayPadded}T00:00:00.000Z`;
      const parsed = new Date(iso);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  // Fallback
  return new Date().toISOString();
}

/**
 * Parse a legacy readTime string like "5 min" into a number (minutes).
 * Falls back to 1 if the value cannot be parsed.
 *
 * @param {string|number} readTime - Legacy readTime value
 * @returns {number} Read time in minutes (minimum 1)
 */
function parseLegacyReadTime(readTime) {
  if (typeof readTime === 'number') return Math.max(1, readTime);
  if (typeof readTime === 'string') {
    const match = readTime.match(/(\d+)/);
    if (match) return Math.max(1, parseInt(match[1], 10));
  }
  return 1;
}

/**
 * Generate a URL-safe slug from a French title string.
 *
 * Algorithm (per design doc):
 *  1. Convert to lowercase
 *  2. Replace accented/special characters: é→e, è→e, à→a, ê→e, ô→o, etc.
 *  3. Replace non-alphanumeric characters with hyphens
 *  4. Collapse consecutive hyphens into one
 *  5. Remove leading/trailing hyphens
 *
 * @param {string} title - Article title (may contain French accents)
 * @returns {string} URL-safe slug (non-empty)
 */
function generateSlug(title) {
  if (!title || typeof title !== 'string') return 'article';

  return title
    .toLowerCase()
    // Normalize accented characters to their ASCII equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics after NFD decomposition
    // Remove remaining special characters that don't decompose (e.g. ł, ø, œ, æ)
    .replace(/[^\w\s-]/g, ' ')
    // Replace whitespace and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Collapse consecutive hyphens
    .replace(/-{2,}/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // If empty after processing, fall back to "article"
    || 'article';
}

/**
 * Generate a canonical URL for a given slug.
 * Uses the L'Maaza blog base URL pattern.
 *
 * @param {string} slug - URL-safe slug
 * @returns {string} Canonical URL
 */
function generateCanonicalUrl(slug) {
  const baseUrl = 'https://lmaaza.com/blog';
  return `${baseUrl}/${slug}`;
}

/**
 * Generate Open Graph tags for a legacy blog post.
 *
 * @param {object} post - Legacy blog post object
 * @param {string} slug - Generated slug for the post
 * @returns {object} OpenGraphTags object
 */
function generateOpenGraph(post, slug) {
  const canonicalUrl = generateCanonicalUrl(slug);
  return {
    ogTitle: post.title || '',
    ogDescription: (post.excerpt || '').slice(0, 160),
    ogImage: null, // Legacy posts have emoji images, not URL-based images
    ogType: 'article',
    ogUrl: canonicalUrl,
  };
}

/**
 * Generate a UUID v4.
 * Uses crypto.randomUUID() when available (Node 14.17+, modern browsers),
 * otherwise falls back to a manual implementation.
 *
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  // Node.js 14.17+ and modern browsers provide crypto.randomUUID()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Transform a single legacy blog post into the new Article schema.
 * Requirements: 10.3 (preserve all data), 10.4 (status "published"), 10.5 (unique UUID)
 *
 * @param {object} post - Legacy blog post from data.js blogPosts array
 * @returns {object} Article object matching the new Article schema
 */
function transformPost(post) {
  const id = generateUUID();
  const slug = generateSlug(post.title);
  const dateIso = parseLegacyDate(post.date);
  const readTime = parseLegacyReadTime(post.readTime);

  // Use content if available; fall back to excerpt (requirement 10.3: preserve all data)
  const content = post.content || post.excerpt || '';

  const seoDescription = (post.excerpt || '').slice(0, 160);

  return {
    // Identity (Requirement 10.5: unique UUID)
    id,

    // Content (Requirement 10.3: preserve title, excerpt, content, author)
    title: post.title,
    excerpt: post.excerpt,
    content,

    // Classification (Requirement 10.3: preserve category)
    category: post.category,
    tags: [],

    // Media — legacy posts use emoji as image; no featuredImage URL available
    featuredImage: null,

    // Metadata (Requirement 10.3: preserve author, readTime)
    author: post.author,
    readTime,
    slug,

    // Status (Requirement 10.4: migrated articles = "published")
    status: 'published',
    createdAt: dateIso,
    updatedAt: dateIso,
    publishedAt: dateIso,

    // SEO metadata
    seoMetadata: {
      title: null, // null means use article.title as default per Requirement 6.4
      description: seoDescription,
      keywords: [],
      canonicalUrl: generateCanonicalUrl(slug),
      openGraph: generateOpenGraph(post, slug),
    },
  };
}

/**
 * Migrate all blog posts from the legacy blogPosts array to the new Article schema.
 * Requirements: 10.2, 10.3, 10.4, 10.5
 *
 * This function is the primary export for use in tests and other modules.
 * It uses the LEGACY_BLOG_POSTS constant defined in this file (which mirrors
 * the blogPosts array from src/data.js without JSX dependencies).
 *
 * @param {Array} [legacyPosts] - Optional: override the default blog posts array.
 *   Useful for testing with custom data.
 * @returns {Array<object>} Array of migrated Article objects
 */
export function migrateArticles(legacyPosts) {
  const posts = legacyPosts || LEGACY_BLOG_POSTS;
  return posts.map(transformPost);
}

// Also export helper functions for testing and reuse
export { generateSlug, generateCanonicalUrl, parseLegacyDate, parseLegacyReadTime, generateUUID, transformPost };

// ---------------------------------------------------------------------------
// CLI support
//
// This module is designed as an importable ES module.  To run the migration
// from the command line, use the companion CJS wrapper:
//
//   node scripts/runMigration.cjs [output.json]
//
// That wrapper calls migrateArticles() and writes the result to a JSON file.
// ---------------------------------------------------------------------------
