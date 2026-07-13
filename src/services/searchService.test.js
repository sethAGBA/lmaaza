/**
 * Unit tests for SearchService.
 * Requirements: 4.2 (search scope), 4.3 (relevance ordering), 4.7 (highlight preservation)
 */

import { SearchService } from './searchService';
import { ArticleService } from './articleService';
import { InMemoryAdapter } from '../adapters/inMemoryAdapter';
import { ARTICLE_STATUS } from '../models/article';

// ── helpers ─────────────────────────────────────────────────────────────────

const BASE_CONTENT =
  'This is valid test content that meets the minimum requirement of 100 characters for article content validation in the blog system.';

/**
 * Build an ArticleService backed by an InMemoryAdapter.
 * Returns { articleService, searchService }.
 */
function createServices() {
  const adapter = new InMemoryAdapter();
  const articleService = new ArticleService(adapter, null);
  const searchService = new SearchService(articleService);
  return { articleService, searchService };
}

/**
 * Create and publish an article.  Returns the published Article.
 */
async function createPublished(articleService, overrides = {}) {
  const defaults = {
    title: 'Default Title',
    excerpt: 'Default excerpt text.',
    content: BASE_CONTENT,
    category: 'Agriculture',
    author: 'Author',
    tags: [],
  };
  const article = await articleService.createArticle({ ...defaults, ...overrides });
  return articleService.publishArticle(article.id);
}

// ── searchFullText ───────────────────────────────────────────────────────────

describe('SearchService.searchFullText', () => {
  it('returns empty array for empty query', async () => {
    const { searchService } = createServices();
    expect(await searchService.searchFullText('')).toEqual([]);
    expect(await searchService.searchFullText('   ')).toEqual([]);
  });

  it('returns empty array when no articles match', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, { title: 'Farming techniques' });
    const results = await searchService.searchFullText('zxqwerty9999');
    expect(results).toHaveLength(0);
  });

  it('finds article by title match (requirement 4.2)', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, { title: 'Organic Farming Guide' });
    const results = await searchService.searchFullText('Organic');
    expect(results).toHaveLength(1);
    expect(results[0].matchedFields).toContain('title');
  });

  it('finds article by excerpt match (requirement 4.2)', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, { excerpt: 'Tips on permaculture gardening' });
    const results = await searchService.searchFullText('permaculture');
    expect(results).toHaveLength(1);
    expect(results[0].matchedFields).toContain('excerpt');
  });

  it('finds article by content match (requirement 4.2)', async () => {
    const { articleService, searchService } = createServices();
    const uniqueWord = 'xylographyUniqueWord';
    const content = BASE_CONTENT + ' ' + uniqueWord;
    await createPublished(articleService, { content });
    const results = await searchService.searchFullText(uniqueWord);
    expect(results).toHaveLength(1);
    expect(results[0].matchedFields).toContain('content');
  });

  it('search is case-insensitive', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, { title: 'Solar Energy Basics' });
    const results = await searchService.searchFullText('solar energy');
    expect(results).toHaveLength(1);
  });

  it('excludes draft articles (requirement 4.2)', async () => {
    const { articleService, searchService } = createServices();
    // Create but do NOT publish
    await articleService.createArticle({
      title: 'Draft Solar Article',
      excerpt: 'Draft excerpt text.',
      content: BASE_CONTENT,
      category: 'Agriculture',
      author: 'Author',
    });
    const results = await searchService.searchFullText('Solar');
    expect(results).toHaveLength(0);
  });

  it('returns all matched fields when query appears in multiple fields', async () => {
    const { articleService, searchService } = createServices();
    const kw = 'innovation';
    await createPublished(articleService, {
      title: `Innovation in Agriculture`,
      excerpt: `innovation drives growth`,
      content: BASE_CONTENT + ` innovation is key`,
    });
    const results = await searchService.searchFullText(kw);
    expect(results).toHaveLength(1);
    expect(results[0].matchedFields).toContain('title');
    expect(results[0].matchedFields).toContain('excerpt');
    expect(results[0].matchedFields).toContain('content');
  });

  // ── Relevance ordering (requirement 4.3) ──────────────────────────────────

  it('ranks title match higher than excerpt-only match (requirement 4.3)', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, {
      title: 'tech article',
      excerpt: 'nothing special here',
      content: BASE_CONTENT,
    });
    await createPublished(articleService, {
      title: 'Unrelated heading',
      excerpt: 'tech improvements in the field',
      content: BASE_CONTENT,
    });
    const results = await searchService.searchFullText('tech');
    expect(results[0].matchedFields).toContain('title');
    expect(results[0].relevanceScore).toBeGreaterThan(results[1].relevanceScore);
  });

  it('ranks title match higher than content-only match (requirement 4.3)', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, {
      title: 'biogas usage',
      excerpt: 'nothing',
      content: BASE_CONTENT,
    });
    await createPublished(articleService, {
      title: 'Unrelated',
      excerpt: 'nothing',
      content: BASE_CONTENT + ' biogas is important',
    });
    const results = await searchService.searchFullText('biogas');
    expect(results[0].matchedFields).toContain('title');
  });

  it('ranks excerpt match higher than content-only match (requirement 4.3)', async () => {
    const { articleService, searchService } = createServices();
    await createPublished(articleService, {
      title: 'Other',
      excerpt: 'solar panels excerpt',
      content: BASE_CONTENT,
    });
    await createPublished(articleService, {
      title: 'Other2',
      excerpt: 'nothing',
      content: BASE_CONTENT + ' solar energy content',
    });
    const results = await searchService.searchFullText('solar');
    // excerpt-matching article should rank first (score 2 vs 1)
    expect(results[0].matchedFields).toContain('excerpt');
    expect(results[0].relevanceScore).toBeGreaterThan(results[1].relevanceScore);
  });

  it('returns correct relevance scores for each weight', async () => {
    const { articleService, searchService } = createServices();
    const kw = 'agritech';
    // Title only
    await createPublished(articleService, {
      title: `agritech overview`,
      excerpt: 'nothing',
      content: BASE_CONTENT,
    });
    const results = await searchService.searchFullText(kw);
    expect(results[0].relevanceScore).toBe(3); // title weight
  });

  it('scores title + excerpt + content match as 6', async () => {
    const { articleService, searchService } = createServices();
    const kw = 'fullmatch';
    await createPublished(articleService, {
      title: 'fullmatch title',
      excerpt: 'fullmatch in excerpt',
      content: BASE_CONTENT + ' fullmatch in content',
    });
    const results = await searchService.searchFullText(kw);
    expect(results[0].relevanceScore).toBe(6); // 3 + 2 + 1
  });
});

// ── highlightMatches ─────────────────────────────────────────────────────────

describe('SearchService.highlightMatches', () => {
  let searchService;

  beforeEach(() => {
    const { searchService: ss } = createServices();
    searchService = ss;
  });

  it('wraps matched terms with <mark class="highlight"> tags', () => {
    const result = searchService.highlightMatches('Hello world', 'world');
    expect(result).toBe('Hello <mark class="highlight">world</mark>');
  });

  it('is case-insensitive', () => {
    const result = searchService.highlightMatches('Solar energy is great', 'solar');
    expect(result).toContain('<mark class="highlight">Solar</mark>');
  });

  it('preserves original casing in matched text', () => {
    const result = searchService.highlightMatches('React is GREAT', 'great');
    expect(result).toBe('React is <mark class="highlight">GREAT</mark>');
  });

  it('highlights multiple occurrences', () => {
    const result = searchService.highlightMatches('cat and cat', 'cat');
    const matches = (result.match(/<mark class="highlight">/g) || []).length;
    expect(matches).toBe(2);
  });

  it('returns original text unchanged when query is empty', () => {
    const original = 'Some text here';
    expect(searchService.highlightMatches(original, '')).toBe(original);
    expect(searchService.highlightMatches(original, '   ')).toBe(original);
  });

  it('returns original text unchanged when query is not found', () => {
    const original = 'Hello world';
    expect(searchService.highlightMatches(original, 'zzznomatch')).toBe(original);
  });

  it('returns empty string for empty text', () => {
    expect(searchService.highlightMatches('', 'query')).toBe('');
  });

  it('is idempotent — stripping markup returns original text (requirement 4.7)', () => {
    const original = 'Agriculture is key to sustainable development.';
    const highlighted = searchService.highlightMatches(original, 'Agriculture');
    // Strip all HTML tags
    const stripped = highlighted.replace(/<[^>]*>/g, '');
    expect(stripped).toBe(original);
  });

  it('handles regex special characters in query without throwing', () => {
    const original = 'Price is $5.00 (USD)';
    const result = searchService.highlightMatches(original, '$5.00');
    expect(result).toContain('<mark class="highlight">$5.00</mark>');
    // Stripping markup still gives back original text
    const stripped = result.replace(/<[^>]*>/g, '');
    expect(stripped).toBe(original);
  });

  it('does not add or remove text — only adds markup (requirement 4.7)', () => {
    const original = 'Innovation drives progress in tech sectors.';
    const highlighted = searchService.highlightMatches(original, 'tech');
    const stripped = highlighted.replace(/<[^>]*>/g, '');
    expect(stripped).toBe(original);
  });
});

// ── indexArticle ─────────────────────────────────────────────────────────────

describe('SearchService.indexArticle', () => {
  it('is callable without throwing (no-op implementation)', () => {
    const { searchService } = createServices();
    expect(() => searchService.indexArticle({ id: '1', title: 'Test' })).not.toThrow();
  });
});
