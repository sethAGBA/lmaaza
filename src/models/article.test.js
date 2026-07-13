/**
 * Unit tests for Article model and validation.
 */

import {
  VALID_CATEGORIES,
  ARTICLE_STATUS,
  createArticleObject,
  createDefaultSEOMetadata,
  calculateReadTime,
  validateArticleInput,
  isValidCategory,
} from './article';

describe('Article Model', () => {
  describe('createArticleObject', () => {
    it('should create an article with all required fields', () => {
      const input = {
        title: 'Test Article',
        excerpt: 'This is a test excerpt',
        content: 'This is test content that is long enough to meet the minimum requirement of 100 characters for article content validation.',
        category: 'Agriculture',
        author: 'Test Author',
      };
      const id = 'test-id-123';

      const article = createArticleObject(input, id);

      expect(article.id).toBe(id);
      expect(article.title).toBe(input.title);
      expect(article.excerpt).toBe(input.excerpt);
      expect(article.content).toBe(input.content);
      expect(article.category).toBe(input.category);
      expect(article.author).toBe(input.author);
      expect(article.status).toBe(ARTICLE_STATUS.DRAFT);
      expect(article.createdAt).toBeDefined();
      expect(article.updatedAt).toBeDefined();
      expect(article.publishedAt).toBeNull();
    });

    it('should initialize with empty tags if not provided', () => {
      const input = {
        title: 'Test',
        excerpt: 'Test excerpt',
        content: 'Test content that is long enough to meet the minimum requirement of 100 characters for article content validation.',
        category: 'Agriculture',
        author: 'Author',
      };

      const article = createArticleObject(input, 'id-1');
      expect(article.tags).toEqual([]);
    });

    it('should calculate read time from content', () => {
      const input = {
        title: 'Test',
        excerpt: 'Test excerpt',
        content: 'word '.repeat(250), // 250 words
        category: 'Agriculture',
        author: 'Author',
      };

      const article = createArticleObject(input, 'id-1');
      expect(article.readTime).toBeGreaterThan(0);
    });
  });

  describe('calculateReadTime', () => {
    it('should return 1 minute for empty content', () => {
      expect(calculateReadTime('')).toBe(1);
      expect(calculateReadTime(null)).toBe(1);
    });

    it('should calculate correctly for 200 words (1 minute)', () => {
      const content = 'word '.repeat(200);
      expect(calculateReadTime(content)).toBe(1);
    });

    it('should calculate correctly for 400 words (2 minutes)', () => {
      const content = 'word '.repeat(400);
      expect(calculateReadTime(content)).toBe(2);
    });

    it('should strip HTML tags before counting', () => {
      const content = '<p>' + 'word '.repeat(200) + '</p>';
      expect(calculateReadTime(content)).toBe(1);
    });
  });

  describe('validateArticleInput', () => {
    const validInput = {
      title: 'Valid Title',
      excerpt: 'Valid excerpt',
      content: 'Valid content that is long enough to meet the minimum requirement of 100 characters for article content validation.',
      category: 'Agriculture',
      author: 'Valid Author',
    };

    it('should return no errors for valid input', () => {
      const errors = validateArticleInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it('should require title', () => {
      const input = { ...validInput, title: '' };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should enforce title max length', () => {
      const input = { ...validInput, title: 'a'.repeat(201) };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'title' && e.code === 'TOO_LONG')).toBe(true);
    });

    it('should require excerpt', () => {
      const input = { ...validInput, excerpt: '' };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'excerpt')).toBe(true);
    });

    it('should enforce excerpt max length', () => {
      const input = { ...validInput, excerpt: 'a'.repeat(201) };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'excerpt' && e.code === 'TOO_LONG')).toBe(true);
    });

    it('should require content with minimum 100 characters', () => {
      const input = { ...validInput, content: 'short' };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'content')).toBe(true);
    });

    it('should require valid category', () => {
      const input = { ...validInput, category: 'InvalidCategory' };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'category' && e.code === 'INVALID_VALUE')).toBe(true);
    });

    it('should accept all valid categories', () => {
      VALID_CATEGORIES.forEach((category) => {
        const input = { ...validInput, category };
        const errors = validateArticleInput(input);
        expect(errors.filter((e) => e.field === 'category')).toHaveLength(0);
      });
    });

    it('should enforce max 10 tags', () => {
      const input = { ...validInput, tags: Array(11).fill('tag') };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'tags' && e.code === 'TOO_LONG')).toBe(true);
    });

    it('should enforce tag max length of 50 characters', () => {
      const input = { ...validInput, tags: ['a'.repeat(51)] };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field.startsWith('tags'))).toBe(true);
    });

    it('should require author', () => {
      const input = { ...validInput, author: '' };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'author')).toBe(true);
    });

    it('should enforce SEO title max 60 characters', () => {
      const input = {
        ...validInput,
        seoMetadata: { title: 'a'.repeat(61) },
      };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'seoMetadata.title' && e.code === 'TOO_LONG')).toBe(true);
    });

    it('should enforce SEO description max 160 characters', () => {
      const input = {
        ...validInput,
        seoMetadata: { description: 'a'.repeat(161) },
      };
      const errors = validateArticleInput(input);
      expect(errors.some((e) => e.field === 'seoMetadata.description' && e.code === 'TOO_LONG')).toBe(true);
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      VALID_CATEGORIES.forEach((category) => {
        expect(isValidCategory(category)).toBe(true);
      });
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('InvalidCategory')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory(null)).toBe(false);
    });
  });
});
