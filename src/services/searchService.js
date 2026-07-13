/**
 * SearchService provides full-text search across published articles.
 * Requirements: 4.2 (search scope), 4.3 (relevance ordering), 4.7 (highlight preservation)
 */

import { ARTICLE_STATUS } from '../models/article.js';

/**
 * Relevance score weights for field matches.
 * Title matches rank highest, then excerpt, then content.
 */
const RELEVANCE_WEIGHTS = {
  title: 3,
  excerpt: 2,
  content: 1,
};

/**
 * Strip HTML tags from a string for plain-text matching.
 * @param {string} str
 * @returns {string}
 */
function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if a field value contains the query (case-insensitive).
 * @param {string} fieldValue
 * @param {string} query
 * @returns {boolean}
 */
function fieldContainsQuery(fieldValue, query) {
  if (!fieldValue || !query) return false;
  return stripHtml(fieldValue).toLowerCase().includes(query.toLowerCase());
}

/**
 * SearchService performs full-text search over published articles.
 *
 * Usage:
 *   const searchService = new SearchService(articleService);
 *   const results = await searchService.searchFullText('agriculture');
 *   const highlighted = searchService.highlightMatches('Some text here', 'text');
 */
export class SearchService {
  /**
   * @param {import('./articleService.js').ArticleService} articleService
   */
  constructor(articleService) {
    this.articleService = articleService;
  }

  /**
   * Index an article (no-op in this implementation — search reads live from articleService).
   * Provided to satisfy the SearchService interface contract.
   *
   * @param {object} article - Article to index
   */
  indexArticle(article) {
    // Intentional no-op: search is performed live against articleService.
    // This method exists to satisfy the interface and can be extended for
    // an in-memory index if performance optimisation is needed later.
  }

  /**
   * Search across published articles by full-text matching in title, excerpt, and content.
   * Results are ordered by relevance score (title match = 3 pts, excerpt = 2 pts, content = 1 pt).
   * Only published articles are returned.
   *
   * Requirements: 4.2, 4.3
   *
   * @param {string} query - Search query string
   * @returns {Promise<Array<{article: object, relevanceScore: number, matchedFields: string[]}>>}
   */
  async searchFullText(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.trim();

    // Fetch all published articles from articleService
    const articles = await this.articleService.getPublishedArticles();

    const results = [];

    for (const article of articles) {
      // Only published articles (getPublishedArticles already filters, but be explicit)
      if (article.status !== ARTICLE_STATUS.PUBLISHED) {
        continue;
      }

      const matchedFields = [];
      let relevanceScore = 0;

      // Check title (weight: 3)
      if (fieldContainsQuery(article.title, normalizedQuery)) {
        matchedFields.push('title');
        relevanceScore += RELEVANCE_WEIGHTS.title;
      }

      // Check excerpt (weight: 2)
      if (fieldContainsQuery(article.excerpt, normalizedQuery)) {
        matchedFields.push('excerpt');
        relevanceScore += RELEVANCE_WEIGHTS.excerpt;
      }

      // Check content (weight: 1)
      if (fieldContainsQuery(article.content, normalizedQuery)) {
        matchedFields.push('content');
        relevanceScore += RELEVANCE_WEIGHTS.content;
      }

      // Only include articles that matched at least one field
      if (matchedFields.length > 0) {
        results.push({ article, relevanceScore, matchedFields });
      }
    }

    // Sort by relevance score descending (title matches first per requirement 4.3)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * Wrap all occurrences of the query in the text with <mark class="highlight"> tags.
   * Matching is case-insensitive; the original casing in the text is preserved.
   * The function is idempotent: stripping all markup from the result returns the original text.
   *
   * Requirements: 4.7
   *
   * @param {string} text - The text to highlight within
   * @param {string} query - The search term to highlight
   * @returns {string} Text with matched terms wrapped in <mark class="highlight"> tags
   */
  highlightMatches(text, query) {
    if (!text || typeof text !== 'string') return text || '';
    if (!query || typeof query !== 'string' || query.trim() === '') return text;

    const normalizedQuery = query.trim();

    // Escape any regex special characters in the query so the match is literal
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Use a global case-insensitive regex to find all matches
    const regex = new RegExp(escapedQuery, 'gi');

    // Replace each match with wrapped version, preserving the original matched text
    return text.replace(regex, (match) => `<mark class="highlight">${match}</mark>`);
  }
}

export default SearchService;
