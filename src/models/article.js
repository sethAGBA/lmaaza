/**
 * Article model and validation for the L'Maaza dynamic blog system.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 8.1
 */

/**
 * Valid blog article categories.
 * @type {string[]}
 */
export const VALID_CATEGORIES = [
  'Agriculture',
  'Santé',
  'Éducation',
  'Environnement',
  'Formation',
  'Innovation',
  'Technologie',
];

/**
 * Article status values.
 */
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

/**
 * Creates a new Article object with default values.
 * The article is initialized with status "draft", a createdAt timestamp,
 * and publishedAt = null as per requirements 1.1 and 8.1.
 *
 * @param {object} input - ArticleInput fields
 * @param {string} id - UUID v4 for the article
 * @returns {object} A new Article object
 */
export function createArticleObject(input, id) {
  const now = new Date().toISOString();
  return {
    id,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category,
    tags: input.tags || [],
    featuredImage: input.featuredImage || null,
    author: input.author,
    readTime: input.readTime || calculateReadTime(input.content || ''),
    slug: input.slug || '',
    status: ARTICLE_STATUS.DRAFT,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    seoMetadata: input.seoMetadata || createDefaultSEOMetadata(),
  };
}

/**
 * Creates default SEO metadata.
 * @returns {object} Default SEOMetadata object
 */
export function createDefaultSEOMetadata() {
  return {
    title: null,
    description: null,
    keywords: [],
    canonicalUrl: '',
    openGraph: {
      ogTitle: '',
      ogDescription: '',
      ogImage: null,
      ogType: 'article',
      ogUrl: '',
    },
  };
}

/**
 * Calculates estimated reading time from content.
 * @param {string} content - Article content (plain text or HTML)
 * @returns {number} Reading time in minutes (minimum 1)
 */
export function calculateReadTime(content) {
  if (!content) return 1;
  // Strip HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Validates an ArticleInput object.
 * Returns an array of ValidationError objects (empty array = valid).
 *
 * @param {object} input - The article data to validate
 * @returns {Array<{field: string, message: string, code: string}>}
 */
export function validateArticleInput(input) {
  const errors = [];

  if (!input) {
    errors.push({ field: 'input', message: 'Article input is required', code: 'REQUIRED' });
    return errors;
  }

  // title: required, 1-200 characters, non-whitespace
  if (!input.title || typeof input.title !== 'string') {
    errors.push({ field: 'title', message: 'Le titre est requis', code: 'REQUIRED' });
  } else if (input.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Le titre ne peut pas être vide', code: 'REQUIRED' });
  } else if (input.title.length > 200) {
    errors.push({ field: 'title', message: 'Le titre ne peut pas dépasser 200 caractères', code: 'TOO_LONG' });
  }

  // excerpt: required, 1-200 characters
  if (!input.excerpt || typeof input.excerpt !== 'string') {
    errors.push({ field: 'excerpt', message: "L'extrait est requis", code: 'REQUIRED' });
  } else if (input.excerpt.trim().length === 0) {
    errors.push({ field: 'excerpt', message: "L'extrait ne peut pas être vide", code: 'REQUIRED' });
  } else if (input.excerpt.length > 200) {
    errors.push({ field: 'excerpt', message: "L'extrait ne peut pas dépasser 200 caractères", code: 'TOO_LONG' });
  }

  // content: required, minimum 100 characters
  if (!input.content || typeof input.content !== 'string') {
    errors.push({ field: 'content', message: 'Le contenu est requis', code: 'REQUIRED' });
  } else if (input.content.trim().length < 100) {
    errors.push({ field: 'content', message: 'Le contenu doit contenir au moins 100 caractères', code: 'TOO_SHORT' });
  }

  // category: required, must be valid Category value
  if (!input.category) {
    errors.push({ field: 'category', message: 'La catégorie est requise', code: 'REQUIRED' });
  } else if (!VALID_CATEGORIES.includes(input.category)) {
    errors.push({
      field: 'category',
      message: `La catégorie doit être l'une des suivantes : ${VALID_CATEGORIES.join(', ')}`,
      code: 'INVALID_VALUE',
    });
  }

  // tags: optional, max 10, each 1-50 characters
  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags)) {
      errors.push({ field: 'tags', message: 'Les tags doivent être un tableau', code: 'INVALID_FORMAT' });
    } else {
      if (input.tags.length > 10) {
        errors.push({ field: 'tags', message: 'Un article ne peut pas avoir plus de 10 tags', code: 'TOO_LONG' });
      }
      input.tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push({ field: `tags[${index}]`, message: 'Chaque tag doit être une chaîne non vide', code: 'INVALID_FORMAT' });
        } else if (tag.length > 50) {
          errors.push({ field: `tags[${index}]`, message: 'Chaque tag ne peut pas dépasser 50 caractères', code: 'TOO_LONG' });
        }
      });
    }
  }

  // author: required, 1-100 characters
  if (!input.author || typeof input.author !== 'string') {
    errors.push({ field: 'author', message: "L'auteur est requis", code: 'REQUIRED' });
  } else if (input.author.trim().length === 0) {
    errors.push({ field: 'author', message: "L'auteur ne peut pas être vide", code: 'REQUIRED' });
  } else if (input.author.length > 100) {
    errors.push({ field: 'author', message: "Le nom de l'auteur ne peut pas dépasser 100 caractères", code: 'TOO_LONG' });
  }

  // seoMetadata: optional fields validation
  if (input.seoMetadata) {
    if (input.seoMetadata.title !== null && input.seoMetadata.title !== undefined) {
      if (typeof input.seoMetadata.title !== 'string') {
        errors.push({ field: 'seoMetadata.title', message: 'Le titre SEO doit être une chaîne de caractères', code: 'INVALID_FORMAT' });
      } else if (input.seoMetadata.title.length > 60) {
        errors.push({ field: 'seoMetadata.title', message: 'Le titre SEO ne peut pas dépasser 60 caractères', code: 'TOO_LONG' });
      }
    }
    if (input.seoMetadata.description !== null && input.seoMetadata.description !== undefined) {
      if (typeof input.seoMetadata.description !== 'string') {
        errors.push({ field: 'seoMetadata.description', message: 'La description SEO doit être une chaîne de caractères', code: 'INVALID_FORMAT' });
      } else if (input.seoMetadata.description.length > 160) {
        errors.push({ field: 'seoMetadata.description', message: 'La description SEO ne peut pas dépasser 160 caractères', code: 'TOO_LONG' });
      }
    }
    if (input.seoMetadata.keywords !== undefined && Array.isArray(input.seoMetadata.keywords)) {
      if (input.seoMetadata.keywords.length > 10) {
        errors.push({ field: 'seoMetadata.keywords', message: 'Les mots-clés SEO ne peuvent pas dépasser 10 entrées', code: 'TOO_LONG' });
      }
    }
  }

  return errors;
}

/**
 * Validates a category value.
 * @param {string} category
 * @returns {boolean}
 */
export function isValidCategory(category) {
  return VALID_CATEGORIES.includes(category);
}
