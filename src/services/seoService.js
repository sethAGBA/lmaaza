/**
 * SEOService provides SEO-related utilities for the L'Maaza dynamic blog system.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 6.9
 */

/**
 * Base URL for canonical URLs.
 */
const BASE_URL = 'https://lmaaza.com/blog';

/**
 * Generate a URL-safe slug from a French title string.
 *
 * Algorithm (per design doc, matching migrateBlogData.js):
 *  1. Convert to lowercase
 *  2. Normalize accented characters using NFD decomposition (é→e, è→e, à→a, etc.)
 *  3. Strip combining diacritics (Unicode range \u0300-\u036f)
 *  4. Replace non-alphanumeric characters with spaces
 *  5. Replace whitespace and underscores with hyphens
 *  6. Collapse consecutive hyphens into one
 *  7. Remove leading/trailing hyphens
 *  8. If empty after processing, fall back to "article"
 *
 * Requirements: 6.9
 *
 * @param {string} title - Article title (may contain French accents)
 * @returns {string} URL-safe slug (non-empty, lowercase, no accents, no consecutive/leading/trailing hyphens)
 */
export function generateSlug(title) {
  if (!title || typeof title !== 'string') return 'article';

  return (
    title
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
      .replace(/^-+|-+$/g, '') || 'article'
  );
}

/**
 * Generate a meta description from content.
 * Strips HTML tags, then takes the first maxLength characters.
 *
 * Requirements: 6.2, 6.5
 *
 * @param {string} content - Article content (may contain HTML)
 * @param {number} [maxLength=160] - Maximum length of the meta description
 * @returns {string} Plain-text meta description
 */
export function generateMetaDescription(content, maxLength = 160) {
  if (!content || typeof content !== 'string') return '';

  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.slice(0, maxLength);
}

/**
 * Generate a canonical URL for a given slug.
 * Format: https://lmaaza.com/blog/{slug}
 *
 * Requirements: 6.6
 *
 * @param {string} slug - URL-safe slug
 * @returns {string} Canonical URL
 */
export function generateCanonicalUrl(slug) {
  return `${BASE_URL}/${slug}`;
}

/**
 * Generate Open Graph tags for an article.
 * Returns an object with all required OG fields.
 *
 * Requirements: 6.8
 *
 * @param {object} article - Article object
 * @param {string} article.title - Article title
 * @param {string} [article.excerpt] - Article excerpt
 * @param {object} [article.featuredImage] - Featured image asset
 * @param {string} [article.slug] - Article slug
 * @param {object} [article.seoMetadata] - SEO metadata
 * @returns {object} OpenGraphTags object: { ogTitle, ogDescription, ogImage, ogType, ogUrl }
 */
export function generateOpenGraphTags(article) {
  if (!article || typeof article !== 'object') {
    return {
      ogTitle: '',
      ogDescription: '',
      ogImage: null,
      ogType: 'article',
      ogUrl: '',
    };
  }

  // ogTitle: use seoMetadata.title if present, otherwise use article.title
  const ogTitle =
    (article.seoMetadata && article.seoMetadata.title) || article.title || '';

  // ogDescription: use seoMetadata.description if present, otherwise first 160 chars of excerpt
  const ogDescription =
    (article.seoMetadata && article.seoMetadata.description) ||
    generateMetaDescription(article.excerpt || '', 160);

  // ogImage: use featuredImage URL if available
  const ogImage =
    article.featuredImage && article.featuredImage.url
      ? article.featuredImage.url
      : null;

  // ogUrl: derive from canonical URL using article slug
  const slug = article.slug || generateSlug(article.title || '');
  const ogUrl =
    (article.seoMetadata && article.seoMetadata.canonicalUrl) ||
    generateCanonicalUrl(slug);

  return {
    ogTitle,
    ogDescription,
    ogImage,
    ogType: 'article',
    ogUrl,
  };
}

/**
 * Validate SEO metadata object.
 * Returns a ValidationResult with valid flag and array of errors.
 *
 * Requirements: 6.1, 6.2, 6.3
 *
 * Validation rules:
 *  - title (optional): max 60 characters
 *  - description (optional): max 160 characters
 *  - keywords (optional): array, max 10 entries, each max 50 characters
 *  - canonicalUrl (optional): must be a valid URL if provided
 *
 * @param {object} metadata - SEOMetadata object to validate
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string, code: string}> }}
 */
export function validateSEOMetadata(metadata) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    errors.push({
      field: 'metadata',
      message: 'Les métadonnées SEO sont requises',
      code: 'REQUIRED',
    });
    return { valid: false, errors };
  }

  // title: optional, max 60 characters
  if (metadata.title !== null && metadata.title !== undefined) {
    if (typeof metadata.title !== 'string') {
      errors.push({
        field: 'title',
        message: 'Le titre SEO doit être une chaîne de caractères',
        code: 'INVALID_FORMAT',
      });
    } else if (metadata.title.length > 60) {
      errors.push({
        field: 'title',
        message: 'Le titre SEO ne peut pas dépasser 60 caractères',
        code: 'TOO_LONG',
      });
    }
  }

  // description: optional, max 160 characters
  if (metadata.description !== null && metadata.description !== undefined) {
    if (typeof metadata.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'La description SEO doit être une chaîne de caractères',
        code: 'INVALID_FORMAT',
      });
    } else if (metadata.description.length > 160) {
      errors.push({
        field: 'description',
        message: 'La description SEO ne peut pas dépasser 160 caractères',
        code: 'TOO_LONG',
      });
    }
  }

  // keywords: optional array, max 10 entries, each max 50 characters
  if (metadata.keywords !== null && metadata.keywords !== undefined) {
    if (!Array.isArray(metadata.keywords)) {
      errors.push({
        field: 'keywords',
        message: 'Les mots-clés doivent être un tableau',
        code: 'INVALID_FORMAT',
      });
    } else {
      if (metadata.keywords.length > 10) {
        errors.push({
          field: 'keywords',
          message: 'Les mots-clés ne peuvent pas dépasser 10 entrées',
          code: 'TOO_LONG',
        });
      }
      metadata.keywords.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          errors.push({
            field: `keywords[${index}]`,
            message: 'Chaque mot-clé doit être une chaîne de caractères',
            code: 'INVALID_FORMAT',
          });
        } else if (keyword.length > 50) {
          errors.push({
            field: `keywords[${index}]`,
            message: 'Chaque mot-clé ne peut pas dépasser 50 caractères',
            code: 'TOO_LONG',
          });
        }
      });
    }
  }

  // canonicalUrl: optional, must be a valid URL format if provided
  if (metadata.canonicalUrl !== null && metadata.canonicalUrl !== undefined && metadata.canonicalUrl !== '') {
    if (typeof metadata.canonicalUrl !== 'string') {
      errors.push({
        field: 'canonicalUrl',
        message: "L'URL canonique doit être une chaîne de caractères",
        code: 'INVALID_FORMAT',
      });
    } else {
      try {
        new URL(metadata.canonicalUrl);
      } catch {
        errors.push({
          field: 'canonicalUrl',
          message: "L'URL canonique n'est pas une URL valide",
          code: 'INVALID_FORMAT',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * SEOService class providing all SEO utilities as instance methods.
 * Can be used as a singleton or instantiated per request.
 */
export class SEOService {
  /**
   * Generate a URL-safe slug from a French title string.
   * @param {string} title
   * @returns {string}
   */
  generateSlug(title) {
    return generateSlug(title);
  }

  /**
   * Generate a meta description from content.
   * @param {string} content
   * @param {number} [maxLength=160]
   * @returns {string}
   */
  generateMetaDescription(content, maxLength = 160) {
    return generateMetaDescription(content, maxLength);
  }

  /**
   * Generate a canonical URL for a given slug.
   * @param {string} slug
   * @returns {string}
   */
  generateCanonicalUrl(slug) {
    return generateCanonicalUrl(slug);
  }

  /**
   * Generate Open Graph tags for an article.
   * @param {object} article
   * @returns {object}
   */
  generateOpenGraphTags(article) {
    return generateOpenGraphTags(article);
  }

  /**
   * Validate SEO metadata.
   * @param {object} metadata
   * @returns {{ valid: boolean, errors: Array }}
   */
  validateSEOMetadata(metadata) {
    return validateSEOMetadata(metadata);
  }
}

// Default singleton instance
const seoService = new SEOService();
export default seoService;
