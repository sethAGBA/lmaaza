/**
 * Integration tests for the blog data migration script.
 * Requirements: 10.2, 10.3, 10.4, 10.5
 *
 * Verifies that all 4 existing blog posts transform correctly to the
 * new Article schema with no data loss.
 */

import {
  migrateArticles,
  generateSlug,
  generateCanonicalUrl,
  parseLegacyDate,
  parseLegacyReadTime,
  transformPost,
} from '../migration/migrateBlogData';

// -----------------------------------------------------------------------
// Sample legacy posts matching the structure in src/data.js
// -----------------------------------------------------------------------
const SAMPLE_LEGACY_POSTS = [
  {
    id: 1,
    title: "L'Innovation Technologique au Service de l'Agriculture Togolaise",
    excerpt:
      "Découvrez comment les technologies modernes transforment l'agriculture traditionnelle au Togo et créent de nouvelles opportunités pour les agriculteurs locaux.",
    author: 'BEBINESSO Toi Bebezseky',
    date: '15 Décembre 2024',
    category: 'Agriculture',
    readTime: '5 min',
    image: '🌾',
    content: `L'agriculture au Togo est à un tournant. Grâce à l'introduction de capteurs simples, d'applications mobiles et de solutions de monitoring, les petits exploitants peuvent aujourd'hui mieux gérer l'eau, optimiser les semis et améliorer les rendements.

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
    content: `La formation Arduino que nous avons tenue avec Tilitu Lab visait à initier les jeunes aux bases de l'électronique et de la programmation. En moins d'une semaine, les participants ont réalisé des prototypes simples.

  Nous pensons que l'apprentissage par la pratique est la clé pour susciter des vocations et fournir des compétences utiles pour l'emploi local.`,
  },
  {
    id: 3,
    title: 'Le Serveur Automatique : Innovation et Tradition Réunies',
    excerpt:
      "Comment notre serveur automatique de boissons locales préserve les traditions tout en apportant l'innovation technologique.",
    author: "L'Maaza Team",
    date: '5 Décembre 2024',
    category: 'Innovation',
    readTime: '6 min',
    image: '🤖',
    content: `Le serveur automatique de boissons locales est un projet qui combine savoir-faire traditionnel et technologie locale. Il garantit l'hygiène, la disponibilité et une expérience utilisateur moderne tout en valorisant des recettes locales.

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
    content: `Encourager les filles vers les études technologiques est un enjeu majeur pour l'égalité des chances et le développement.

  Investir dans l'éducation technologique des filles, c'est investir dans un avenir plus inclusif et innovant.`,
  },
];

// -----------------------------------------------------------------------
// generateSlug tests
// -----------------------------------------------------------------------
describe('generateSlug', () => {
  it('converts a basic French title to a slug', () => {
    const slug = generateSlug('Bonjour le Monde');
    expect(slug).toBe('bonjour-le-monde');
  });

  it('removes French accents (é, è, à, ê, ô, î, etc.)', () => {
    expect(generateSlug('Éducation Technologique')).not.toMatch(/[éèêëàâîïôùûü]/i);
    expect(generateSlug('Santé et Environnement')).not.toMatch(/[éèêëàâîïôùûü]/i);
  });

  it('replaces spaces with hyphens', () => {
    const slug = generateSlug('hello world test');
    expect(slug).toContain('-');
    expect(slug).not.toContain(' ');
  });

  it('collapses consecutive hyphens', () => {
    const slug = generateSlug("L'Innovation : Test--Double");
    expect(slug).not.toMatch(/-{2,}/);
  });

  it('has no leading or trailing hyphens', () => {
    const slug = generateSlug("  L'Article ");
    expect(slug).not.toMatch(/^-|-$/);
  });

  it('is lowercase', () => {
    const slug = generateSlug('UPPERCASE TITLE');
    expect(slug).toBe(slug.toLowerCase());
  });

  it('handles apostrophes (L\'article → no apostrophe)', () => {
    const slug = generateSlug("L'Innovation");
    expect(slug).not.toContain("'");
  });

  it('returns a non-empty string for any reasonable title', () => {
    expect(generateSlug('A')).toBeTruthy();
    expect(generateSlug("L'Innovation Technologique au Service de l'Agriculture Togolaise")).toBeTruthy();
  });

  it('handles the real article titles from data.js', () => {
    const titles = [
      "L'Innovation Technologique au Service de l'Agriculture Togolaise",
      "Formation Arduino : Démystifier l'Électronique pour les Jeunes",
      'Le Serveur Automatique : Innovation et Tradition Réunies',
      "L'Importance de l'Éducation Technologique pour les Filles",
    ];
    titles.forEach((title) => {
      const slug = generateSlug(title);
      // Only lowercase alphanumeric characters and hyphens
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      // No consecutive hyphens
      expect(slug).not.toMatch(/-{2,}/);
      // No leading/trailing hyphens
      expect(slug).not.toMatch(/^-|-$/);
      // Non-empty
      expect(slug.length).toBeGreaterThan(0);
    });
  });
});

// -----------------------------------------------------------------------
// parseLegacyDate tests
// -----------------------------------------------------------------------
describe('parseLegacyDate', () => {
  it('parses a French date string to ISO 8601', () => {
    const iso = parseLegacyDate('15 Décembre 2024');
    expect(iso).toMatch(/^2024-12-15/);
  });

  it('parses single-digit day correctly', () => {
    const iso = parseLegacyDate('1 Décembre 2024');
    expect(iso).toMatch(/^2024-12-01/);
  });

  it('parses all French months', () => {
    const months = [
      ['Janvier', '01'], ['Février', '02'], ['Mars', '03'], ['Avril', '04'],
      ['Mai', '05'], ['Juin', '06'], ['Juillet', '07'], ['Août', '08'],
      ['Septembre', '09'], ['Octobre', '10'], ['Novembre', '11'], ['Décembre', '12'],
    ];
    months.forEach(([name, num]) => {
      const iso = parseLegacyDate(`10 ${name} 2024`);
      expect(iso).toMatch(new RegExp(`^2024-${num}-10`));
    });
  });

  it('falls back to a valid date for invalid input', () => {
    const iso = parseLegacyDate('invalid date');
    expect(new Date(iso).getTime()).not.toBeNaN();
  });

  it('falls back to a valid date for null/undefined', () => {
    expect(new Date(parseLegacyDate(null)).getTime()).not.toBeNaN();
    expect(new Date(parseLegacyDate(undefined)).getTime()).not.toBeNaN();
  });
});

// -----------------------------------------------------------------------
// parseLegacyReadTime tests
// -----------------------------------------------------------------------
describe('parseLegacyReadTime', () => {
  it('parses "5 min" as 5', () => {
    expect(parseLegacyReadTime('5 min')).toBe(5);
  });

  it('parses "4 min" as 4', () => {
    expect(parseLegacyReadTime('4 min')).toBe(4);
  });

  it('accepts a raw number', () => {
    expect(parseLegacyReadTime(3)).toBe(3);
  });

  it('returns at least 1 for any input', () => {
    expect(parseLegacyReadTime('0 min')).toBe(1);
    expect(parseLegacyReadTime(0)).toBe(1);
    expect(parseLegacyReadTime('invalid')).toBe(1);
  });
});

// -----------------------------------------------------------------------
// transformPost tests
// -----------------------------------------------------------------------
describe('transformPost', () => {
  it('generates a UUID-format id', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    // UUID v4 pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(article.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('preserves the title (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.title).toBe(post.title);
  });

  it('preserves the excerpt (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.excerpt).toBe(post.excerpt);
  });

  it('preserves content (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.content).toBe(post.content);
  });

  it('uses excerpt as content fallback when content is missing', () => {
    const post = { ...SAMPLE_LEGACY_POSTS[0], content: undefined };
    const article = transformPost(post);
    expect(article.content).toBe(post.excerpt);
  });

  it('preserves the author (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[1];
    const article = transformPost(post);
    expect(article.author).toBe(post.author);
  });

  it('preserves the category (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.category).toBe(post.category);
  });

  it('preserves readTime (Requirement 10.3)', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.readTime).toBe(5);
  });

  it('sets status to "published" (Requirement 10.4)', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.status).toBe('published');
  });

  it('sets publishedAt to the parsed date', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.publishedAt).toMatch(/^2024-12-15/);
  });

  it('generates a valid slug (URL-safe characters only)', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.slug).toMatch(/^[a-z0-9-]+$/);
    expect(article.slug.length).toBeGreaterThan(0);
  });

  it('generates SEO metadata with canonical URL', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.seoMetadata).toBeDefined();
    expect(article.seoMetadata.canonicalUrl).toContain(article.slug);
  });

  it('sets seoMetadata.title to null (fallback to article title per Req 6.4)', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.seoMetadata.title).toBeNull();
  });

  it('sets seoMetadata.description to first 160 chars of excerpt', () => {
    const post = SAMPLE_LEGACY_POSTS[0];
    const article = transformPost(post);
    expect(article.seoMetadata.description).toBe(post.excerpt.slice(0, 160));
  });

  it('includes Open Graph tags with required fields', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    const { openGraph } = article.seoMetadata;
    expect(openGraph.ogTitle).toBeTruthy();
    expect(openGraph.ogDescription).toBeTruthy();
    expect(openGraph.ogType).toBe('article');
    expect(openGraph.ogUrl).toContain(article.slug);
  });

  it('initializes empty tags array', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.tags).toEqual([]);
  });

  it('sets featuredImage to null (emoji images are not URL-based)', () => {
    const article = transformPost(SAMPLE_LEGACY_POSTS[0]);
    expect(article.featuredImage).toBeNull();
  });
});

// -----------------------------------------------------------------------
// migrateArticles integration tests (Requirement 10.2)
// -----------------------------------------------------------------------
describe('migrateArticles', () => {
  let articles;

  beforeEach(() => {
    articles = migrateArticles(SAMPLE_LEGACY_POSTS);
  });

  it('migrates all 4 existing blog posts (Requirement 10.2)', () => {
    expect(articles).toHaveLength(4);
  });

  it('uses the default LEGACY_BLOG_POSTS when no argument given', () => {
    const defaultArticles = migrateArticles();
    expect(defaultArticles).toHaveLength(4);
  });

  it('every article has a unique UUID (Requirement 10.5)', () => {
    const ids = articles.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(articles.length);
  });

  it('every article has status "published" (Requirement 10.4)', () => {
    articles.forEach((article) => {
      expect(article.status).toBe('published');
    });
  });

  it('every article has a valid slug', () => {
    articles.forEach((article) => {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.slug.length).toBeGreaterThan(0);
    });
  });

  it('preserves title for each post (Requirement 10.3)', () => {
    articles.forEach((article, i) => {
      expect(article.title).toBe(SAMPLE_LEGACY_POSTS[i].title);
    });
  });

  it('preserves excerpt for each post (Requirement 10.3)', () => {
    articles.forEach((article, i) => {
      expect(article.excerpt).toBe(SAMPLE_LEGACY_POSTS[i].excerpt);
    });
  });

  it('preserves author for each post (Requirement 10.3)', () => {
    articles.forEach((article, i) => {
      expect(article.author).toBe(SAMPLE_LEGACY_POSTS[i].author);
    });
  });

  it('preserves category for each post (Requirement 10.3)', () => {
    articles.forEach((article, i) => {
      expect(article.category).toBe(SAMPLE_LEGACY_POSTS[i].category);
    });
  });

  it('preserves readTime for each post (Requirement 10.3)', () => {
    const expectedReadTimes = [5, 4, 6, 7];
    articles.forEach((article, i) => {
      expect(article.readTime).toBe(expectedReadTimes[i]);
    });
  });

  it('preserves content for each post (Requirement 10.3)', () => {
    articles.forEach((article, i) => {
      const expectedContent = SAMPLE_LEGACY_POSTS[i].content || SAMPLE_LEGACY_POSTS[i].excerpt;
      expect(article.content).toBe(expectedContent);
    });
  });

  it('all articles have ISO 8601 timestamps for createdAt, updatedAt, publishedAt', () => {
    articles.forEach((article) => {
      expect(new Date(article.createdAt).getTime()).not.toBeNaN();
      expect(new Date(article.updatedAt).getTime()).not.toBeNaN();
      expect(new Date(article.publishedAt).getTime()).not.toBeNaN();
    });
  });

  it('all articles have SEO metadata with canonical URL', () => {
    articles.forEach((article) => {
      expect(article.seoMetadata).toBeDefined();
      expect(article.seoMetadata.canonicalUrl).toContain(article.slug);
    });
  });

  it('Agriculture article gets correct category', () => {
    const agri = articles.find((a) => a.category === 'Agriculture');
    expect(agri).toBeDefined();
    expect(agri.title).toContain('Agriculture');
  });

  it('Formation article gets correct category', () => {
    const formation = articles.find((a) => a.category === 'Formation');
    expect(formation).toBeDefined();
  });

  it('Innovation article gets correct category', () => {
    const innovation = articles.find((a) => a.category === 'Innovation');
    expect(innovation).toBeDefined();
  });

  it('Éducation article gets correct category', () => {
    const education = articles.find((a) => a.category === 'Éducation');
    expect(education).toBeDefined();
  });

  it('generates unique slugs across all articles', () => {
    const slugs = articles.map((a) => a.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(articles.length);
  });
});

// -----------------------------------------------------------------------
// generateCanonicalUrl tests
// -----------------------------------------------------------------------
describe('generateCanonicalUrl', () => {
  it('includes the slug in the URL', () => {
    const url = generateCanonicalUrl('my-slug');
    expect(url).toContain('my-slug');
  });

  it('starts with https://', () => {
    const url = generateCanonicalUrl('any-slug');
    expect(url).toMatch(/^https:\/\//);
  });

  it('contains the blog path', () => {
    const url = generateCanonicalUrl('test-slug');
    expect(url).toContain('/blog/');
  });
});
