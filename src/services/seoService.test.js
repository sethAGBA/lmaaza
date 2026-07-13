/**
 * Unit tests for SEOService.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 6.9
 */

import {
  generateSlug,
  generateMetaDescription,
  generateCanonicalUrl,
  generateOpenGraphTags,
  validateSEOMetadata,
  SEOService,
} from './seoService';

// ---------------------------------------------------------------------------
// generateSlug
// ---------------------------------------------------------------------------
describe('generateSlug', () => {
  it('should convert a simple English title to lowercase hyphenated slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should normalize French accents (é, è, à, ê, ô, etc.)', () => {
    expect(generateSlug('Éducation et Technologie')).toBe('education-et-technologie');
    expect(generateSlug('Santé et Développement')).toBe('sante-et-developpement');
    expect(generateSlug('Forêt Tropicale')).toBe('foret-tropicale');
    expect(generateSlug('Données Agraires')).toBe('donnees-agraires');
  });

  it('should handle the example from the design doc (apostrophe becomes hyphen)', () => {
    // The apostrophe in "L'Innovation" is treated as a separator, producing "l-innovation..."
    const slug = generateSlug("L'Innovation Technologique au Service");
    // Must be URL-safe (lowercase, alphanumeric + hyphens only)
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    expect(slug).toContain('innovation');
    expect(slug).toContain('technologique');
    expect(slug).toContain('service');
  });

  it('should replace non-alphanumeric characters with hyphens', () => {
    const slug = generateSlug('Article: Test & Demo');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('should collapse consecutive hyphens into one', () => {
    const slug = generateSlug('Hello   World');
    expect(slug).not.toMatch(/-{2,}/);
  });

  it('should remove leading hyphens', () => {
    expect(generateSlug("'leading apostrophe")).not.toMatch(/^-/);
  });

  it('should remove trailing hyphens', () => {
    expect(generateSlug('trailing apostrophe\'')).not.toMatch(/-$/);
  });

  it('should return "article" for null input', () => {
    expect(generateSlug(null)).toBe('article');
  });

  it('should return "article" for undefined input', () => {
    expect(generateSlug(undefined)).toBe('article');
  });

  it('should return "article" for empty string', () => {
    expect(generateSlug('')).toBe('article');
  });

  it('should return "article" for a string that yields an empty slug after processing', () => {
    // A string with only special characters
    expect(generateSlug('---')).toBe('article');
  });

  it('should return only lowercase alphanumeric characters and hyphens', () => {
    const slug = generateSlug('Résumé: Agriculture & Santé (2024)!');
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/);
    expect(slug).not.toMatch(/[^a-z0-9-]/);
  });

  it('should handle titles with numbers', () => {
    expect(generateSlug('Article 2024')).toBe('article-2024');
  });

  it('should handle multi-word accented title with French apostrophes', () => {
    const slug = generateSlug("L'Importance de l'Éducation Technologique pour les Filles");
    // Apostrophes become hyphens; accents are stripped
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    expect(slug).toContain('importance');
    expect(slug).toContain('education');
    expect(slug).toContain('technologique');
    expect(slug).not.toMatch(/-{2,}/); // no consecutive hyphens
  });
});

// ---------------------------------------------------------------------------
// generateMetaDescription
// ---------------------------------------------------------------------------
describe('generateMetaDescription', () => {
  it('should return first 160 characters of plain content', () => {
    const content = 'A'.repeat(200);
    const result = generateMetaDescription(content);
    expect(result.length).toBe(160);
  });

  it('should use default maxLength of 160', () => {
    const content = 'Hello world. This is a blog post excerpt.';
    const result = generateMetaDescription(content);
    expect(result).toBe(content);
    expect(result.length).toBeLessThanOrEqual(160);
  });

  it('should accept a custom maxLength', () => {
    const content = 'Hello world. This is a longer text.';
    const result = generateMetaDescription(content, 10);
    expect(result.length).toBe(10);
    expect(result).toBe('Hello worl');
  });

  it('should strip HTML tags from content', () => {
    const content = '<p>Hello <strong>world</strong>!</p>';
    const result = generateMetaDescription(content);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });

  it('should collapse extra whitespace introduced by HTML stripping', () => {
    const content = '<div>  Hello   <span>world</span>  </div>';
    const result = generateMetaDescription(content);
    expect(result).not.toMatch(/\s{2,}/);
  });

  it('should return empty string for null input', () => {
    expect(generateMetaDescription(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(generateMetaDescription(undefined)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(generateMetaDescription('')).toBe('');
  });

  it('should handle content shorter than maxLength', () => {
    const content = 'Short text';
    expect(generateMetaDescription(content)).toBe('Short text');
  });
});

// ---------------------------------------------------------------------------
// generateCanonicalUrl
// ---------------------------------------------------------------------------
describe('generateCanonicalUrl', () => {
  it('should produce the expected canonical URL', () => {
    expect(generateCanonicalUrl('hello-world')).toBe(
      'https://lmaaza.com/blog/hello-world'
    );
  });

  it('should contain the slug in the URL', () => {
    const slug = 'linnovation-technologique-au-service';
    const url = generateCanonicalUrl(slug);
    expect(url).toContain(slug);
  });

  it('should start with the base URL', () => {
    expect(generateCanonicalUrl('test')).toMatch(/^https:\/\/lmaaza\.com\/blog\//);
  });

  it('should produce a valid URL', () => {
    const url = generateCanonicalUrl('some-slug');
    expect(() => new URL(url)).not.toThrow();
  });

  it('should produce consistent results for the same slug', () => {
    const slug = 'agriculture-togo';
    expect(generateCanonicalUrl(slug)).toBe(generateCanonicalUrl(slug));
  });
});

// ---------------------------------------------------------------------------
// generateOpenGraphTags
// ---------------------------------------------------------------------------
describe('generateOpenGraphTags', () => {
  const baseArticle = {
    title: 'Innovation Agricole',
    excerpt: 'Un article sur l\'innovation agricole au Togo.',
    slug: 'innovation-agricole',
    seoMetadata: null,
    featuredImage: null,
  };

  it('should return all required Open Graph fields', () => {
    const tags = generateOpenGraphTags(baseArticle);
    expect(tags).toHaveProperty('ogTitle');
    expect(tags).toHaveProperty('ogDescription');
    expect(tags).toHaveProperty('ogImage');
    expect(tags).toHaveProperty('ogType');
    expect(tags).toHaveProperty('ogUrl');
  });

  it('should set ogType to "article"', () => {
    expect(generateOpenGraphTags(baseArticle).ogType).toBe('article');
  });

  it('should use article title as ogTitle when no seoMetadata.title', () => {
    const tags = generateOpenGraphTags(baseArticle);
    expect(tags.ogTitle).toBe('Innovation Agricole');
  });

  it('should use seoMetadata.title as ogTitle when provided', () => {
    const article = {
      ...baseArticle,
      seoMetadata: { title: 'SEO Title Override', description: null, canonicalUrl: null },
    };
    expect(generateOpenGraphTags(article).ogTitle).toBe('SEO Title Override');
  });

  it('should use seoMetadata.description as ogDescription when provided', () => {
    const article = {
      ...baseArticle,
      seoMetadata: { title: null, description: 'Custom description', canonicalUrl: null },
    };
    expect(generateOpenGraphTags(article).ogDescription).toBe('Custom description');
  });

  it('should derive ogDescription from excerpt when seoMetadata.description is null', () => {
    const tags = generateOpenGraphTags(baseArticle);
    expect(tags.ogDescription).toContain('innovation agricole');
  });

  it('should set ogImage to null when no featuredImage', () => {
    expect(generateOpenGraphTags(baseArticle).ogImage).toBeNull();
  });

  it('should use featuredImage URL as ogImage when provided', () => {
    const article = {
      ...baseArticle,
      featuredImage: { url: 'https://example.com/image.jpg' },
    };
    expect(generateOpenGraphTags(article).ogImage).toBe('https://example.com/image.jpg');
  });

  it('should include the slug in ogUrl', () => {
    const tags = generateOpenGraphTags(baseArticle);
    expect(tags.ogUrl).toContain('innovation-agricole');
  });

  it('should use seoMetadata.canonicalUrl as ogUrl when provided', () => {
    const article = {
      ...baseArticle,
      seoMetadata: {
        title: null,
        description: null,
        canonicalUrl: 'https://lmaaza.com/blog/custom-slug',
      },
    };
    expect(generateOpenGraphTags(article).ogUrl).toBe(
      'https://lmaaza.com/blog/custom-slug'
    );
  });

  it('should return default empty object shape for null article', () => {
    const tags = generateOpenGraphTags(null);
    expect(tags.ogType).toBe('article');
    expect(tags.ogTitle).toBe('');
    expect(tags.ogDescription).toBe('');
    expect(tags.ogImage).toBeNull();
    expect(tags.ogUrl).toBe('');
  });

  it('ogDescription should not exceed 160 characters', () => {
    const article = {
      ...baseArticle,
      excerpt: 'x'.repeat(300),
    };
    expect(generateOpenGraphTags(article).ogDescription.length).toBeLessThanOrEqual(160);
  });
});

// ---------------------------------------------------------------------------
// validateSEOMetadata
// ---------------------------------------------------------------------------
describe('validateSEOMetadata', () => {
  it('should return valid for a complete valid metadata object', () => {
    const metadata = {
      title: 'SEO Title',
      description: 'A valid meta description under 160 characters.',
      keywords: ['agriculture', 'togo'],
      canonicalUrl: 'https://lmaaza.com/blog/article',
    };
    const result = validateSEOMetadata(metadata);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return valid for empty optional metadata', () => {
    const result = validateSEOMetadata({});
    expect(result.valid).toBe(true);
  });

  it('should return invalid for null input', () => {
    const result = validateSEOMetadata(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should allow null title (uses article title as default)', () => {
    const result = validateSEOMetadata({ title: null });
    expect(result.valid).toBe(true);
  });

  it('should reject title longer than 60 characters', () => {
    const result = validateSEOMetadata({ title: 'a'.repeat(61) });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'title' && e.code === 'TOO_LONG')).toBe(true);
  });

  it('should allow title exactly 60 characters', () => {
    const result = validateSEOMetadata({ title: 'a'.repeat(60) });
    expect(result.valid).toBe(true);
  });

  it('should allow null description (uses excerpt as default)', () => {
    const result = validateSEOMetadata({ description: null });
    expect(result.valid).toBe(true);
  });

  it('should reject description longer than 160 characters', () => {
    const result = validateSEOMetadata({ description: 'a'.repeat(161) });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'description' && e.code === 'TOO_LONG')).toBe(true);
  });

  it('should allow description exactly 160 characters', () => {
    const result = validateSEOMetadata({ description: 'a'.repeat(160) });
    expect(result.valid).toBe(true);
  });

  it('should reject more than 10 keywords', () => {
    const result = validateSEOMetadata({ keywords: Array(11).fill('keyword') });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'keywords' && e.code === 'TOO_LONG')).toBe(true);
  });

  it('should allow exactly 10 keywords', () => {
    const result = validateSEOMetadata({ keywords: Array(10).fill('keyword') });
    expect(result.valid).toBe(true);
  });

  it('should reject a keyword longer than 50 characters', () => {
    const result = validateSEOMetadata({ keywords: ['a'.repeat(51)] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field.startsWith('keywords[') && e.code === 'TOO_LONG')).toBe(true);
  });

  it('should reject an invalid canonical URL', () => {
    const result = validateSEOMetadata({ canonicalUrl: 'not-a-url' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'canonicalUrl' && e.code === 'INVALID_FORMAT')).toBe(true);
  });

  it('should accept a valid canonical URL', () => {
    const result = validateSEOMetadata({ canonicalUrl: 'https://lmaaza.com/blog/my-article' });
    expect(result.valid).toBe(true);
  });

  it('should allow empty string for canonicalUrl (no validation triggered)', () => {
    const result = validateSEOMetadata({ canonicalUrl: '' });
    expect(result.valid).toBe(true);
  });

  it('should return multiple errors for multiple violations', () => {
    const result = validateSEOMetadata({
      title: 'a'.repeat(61),
      description: 'b'.repeat(161),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// SEOService class
// ---------------------------------------------------------------------------
describe('SEOService class', () => {
  let service;

  beforeEach(() => {
    service = new SEOService();
  });

  it('should expose generateSlug as an instance method', () => {
    expect(service.generateSlug('Éducation')).toBe('education');
  });

  it('should expose generateMetaDescription as an instance method', () => {
    expect(service.generateMetaDescription('<p>Hello</p>', 5)).toBe('Hello');
  });

  it('should expose generateCanonicalUrl as an instance method', () => {
    expect(service.generateCanonicalUrl('test-slug')).toBe(
      'https://lmaaza.com/blog/test-slug'
    );
  });

  it('should expose generateOpenGraphTags as an instance method', () => {
    const article = {
      title: 'Test Article',
      excerpt: 'An excerpt.',
      slug: 'test-article',
      seoMetadata: null,
      featuredImage: null,
    };
    const tags = service.generateOpenGraphTags(article);
    expect(tags.ogType).toBe('article');
    expect(tags.ogTitle).toBe('Test Article');
  });

  it('should expose validateSEOMetadata as an instance method', () => {
    const result = service.validateSEOMetadata({ title: 'Valid' });
    expect(result.valid).toBe(true);
  });

  it('instance method results should be identical to standalone function results', () => {
    const title = "L'Innovation Agricole";
    expect(service.generateSlug(title)).toBe(generateSlug(title));
    expect(service.generateCanonicalUrl('test')).toBe(generateCanonicalUrl('test'));
  });
});
