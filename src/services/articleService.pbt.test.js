/**
 * Property-based tests for ArticleService.
 * Uses fast-check library with minimum 100 iterations.
 *
 * Task 1.1: Property 1 - Article Creation Initialization
 * Task 1.2: Property 30 - Article Storage Persistence Round-Trip
 */

import fc from 'fast-check';
import { ArticleService } from './articleService';
import { InMemoryAdapter } from '../adapters/inMemoryAdapter';
import { ARTICLE_STATUS, VALID_CATEGORIES } from '../models/article';

/** Create a fresh service with in-memory storage for each test. */
function createService() {
  const adapter = new InMemoryAdapter();
  return { service: new ArticleService(adapter, null), adapter };
}

/**
 * Arbitrary that generates a string of at least minLen non-whitespace printable characters.
 * This ensures content validation (requiring >= 100 non-whitespace chars) always passes.
 */
const nonEmptyPrintableString = (minLen, maxLen) =>
  fc
    .array(fc.char().filter((c) => c.trim().length > 0), { minLength: minLen, maxLength: maxLen })
    .map((chars) => chars.join(''));

/**
 * Arbitrary that generates valid article inputs.
 * Smart generator constrained to the valid input space.
 */
const validArticleInputArb = fc.record({
  title: nonEmptyPrintableString(1, 200),
  excerpt: nonEmptyPrintableString(1, 200),
  content: nonEmptyPrintableString(100, 2000),
  category: fc.constantFrom(...VALID_CATEGORIES),
  author: nonEmptyPrintableString(1, 100),
  tags: fc.array(
    nonEmptyPrintableString(1, 50),
    { minLength: 0, maxLength: 10 }
  ),
});

/**
 * Property 1: Article Creation Initialization
 * Validates: Requirements 1.1, 8.1
 *
 * For any valid ArticleInput data, when createArticle is called, the returned Article SHALL have:
 * - A non-empty unique id
 * - A valid ISO 8601 createdAt timestamp
 * - status equal to "draft"
 * - updatedAt equal to createdAt
 * - publishedAt equal to null
 */
describe('PBT - Property 1: Article Creation Initialization', () => {
  it(
    'should always return article with correct initial state for any valid input',
    async () => {
      await fc.assert(
        fc.asyncProperty(validArticleInputArb, async (input) => {
          const { service } = createService();
          const article = await service.createArticle(input);

          // id must be non-empty
          expect(typeof article.id).toBe('string');
          expect(article.id.length).toBeGreaterThan(0);

          // status must be "draft"
          expect(article.status).toBe(ARTICLE_STATUS.DRAFT);

          // createdAt must be a valid ISO 8601 timestamp
          expect(typeof article.createdAt).toBe('string');
          const createdDate = new Date(article.createdAt);
          expect(isNaN(createdDate.getTime())).toBe(false);

          // updatedAt must equal createdAt
          expect(article.updatedAt).toBe(article.createdAt);

          // publishedAt must be null
          expect(article.publishedAt).toBeNull();
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    'should always generate unique IDs for different createArticle calls',
    async () => {
      const { service } = createService();
      const ids = new Set();

      await fc.assert(
        fc.asyncProperty(validArticleInputArb, async (input) => {
          const article = await service.createArticle(input);
          // Each call should produce a unique ID
          expect(ids.has(article.id)).toBe(false);
          ids.add(article.id);
        }),
        { numRuns: 50 }
      );
    }
  );
});

/**
 * Property 30: Article Storage Persistence Round-Trip
 * Validates: Requirements 10.1
 *
 * For any valid Article, after saveArticle(article) executes,
 * getArticle(article.id) SHALL return an Article with all fields equal to the original.
 */
describe('PBT - Property 30: Article Storage Persistence Round-Trip', () => {
  it(
    'should preserve all article fields after save and retrieve cycle',
    async () => {
      await fc.assert(
        fc.asyncProperty(validArticleInputArb, async (input) => {
          const { service, adapter } = createService();

          // Create via service (this saves to storage)
          const created = await service.createArticle(input);

          // Retrieve via service
          const retrieved = await service.getArticle(created.id);

          expect(retrieved).not.toBeNull();

          // All fields must be preserved
          expect(retrieved.id).toBe(created.id);
          expect(retrieved.title).toBe(created.title);
          expect(retrieved.excerpt).toBe(created.excerpt);
          expect(retrieved.content).toBe(created.content);
          expect(retrieved.category).toBe(created.category);
          expect(retrieved.author).toBe(created.author);
          expect(retrieved.status).toBe(created.status);
          expect(retrieved.createdAt).toBe(created.createdAt);
          expect(retrieved.updatedAt).toBe(created.updatedAt);
          expect(retrieved.publishedAt).toBe(created.publishedAt);

          // Tags array should be equivalent
          expect(retrieved.tags).toEqual(created.tags);
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    'should preserve article fields after direct adapter save and retrieve',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
            excerpt: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
            content: fc.string({ minLength: 100, maxLength: 2000 }),
            category: fc.constantFrom(...VALID_CATEGORIES),
            author: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
            tags: fc.array(nonEmptyPrintableString(1, 50), { maxLength: 10 }),
            status: fc.constantFrom(ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.PUBLISHED),
            createdAt: fc.date({ min: new Date(2020, 0, 1) }).map((d) => d.toISOString()),
            updatedAt: fc.date({ min: new Date(2020, 0, 1) }).map((d) => d.toISOString()),
            publishedAt: fc.option(
              fc.date({ min: new Date(2020, 0, 1) }).map((d) => d.toISOString()),
              { nil: null }
            ),
            featuredImage: fc.constant(null),
            readTime: fc.integer({ min: 1, max: 60 }),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            seoMetadata: fc.constant({
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
            }),
          }),
          async (article) => {
            const adapter = new InMemoryAdapter();

            // Save and retrieve
            await adapter.saveArticle(article);
            const retrieved = await adapter.getArticle(article.id);

            expect(retrieved).not.toBeNull();
            expect(retrieved.id).toBe(article.id);
            expect(retrieved.title).toBe(article.title);
            expect(retrieved.excerpt).toBe(article.excerpt);
            expect(retrieved.content).toBe(article.content);
            expect(retrieved.category).toBe(article.category);
            expect(retrieved.author).toBe(article.author);
            expect(retrieved.status).toBe(article.status);
            expect(retrieved.createdAt).toBe(article.createdAt);
            expect(retrieved.updatedAt).toBe(article.updatedAt);
            expect(retrieved.publishedAt).toBe(article.publishedAt);
            expect(retrieved.tags).toEqual(article.tags);
            expect(retrieved.readTime).toBe(article.readTime);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
