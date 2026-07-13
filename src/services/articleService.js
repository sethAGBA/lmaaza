/**
 * ArticleService provides CRUD operations for blog articles.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1, 8.3, 8.4
 */

import { v4 as uuidv4 } from 'uuid';
import {
  createArticleObject,
  validateArticleInput,
  ARTICLE_STATUS,
} from '../models/article.js';
import { LEGACY_ID_TO_SLUG } from '../utils/articleDisplayUtils.js';

/**
 * Authorization error for admin-only operations.
 */
export class AuthorizationError extends Error {
  constructor(message, code, requiredRole = 'admin') {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.requiredRole = requiredRole;
  }
}

export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
};

/**
 * ArticleService manages article CRUD operations.
 */
export class ArticleService {
  constructor(storageAdapter, authContext = null) {
    this.storage = storageAdapter;
    this.authContext = authContext;
  }

  /**
   * Check if current user has admin role.
   * @private
   */
  _checkAdminRole() {
    // If no authContext provided, allow operations (for testing/initial setup)
    if (!this.authContext) {
      return true;
    }
    
    if (!this.authContext.user || this.authContext.user.role !== 'admin') {
      throw new AuthorizationError(
        'Accès administrateur requis',
        AUTH_ERROR_CODES.FORBIDDEN,
        'admin'
      );
    }
    return true;
  }

  /**
   * Generate a unique UUID for articles.
   * @private
   */
  _generateId() {
    return uuidv4();
  }

  /**
   * Create a new article.
   * Requirements: 1.1, 8.1
   * 
   * @param {object} input - ArticleInput data
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<object>} The created Article
   */
  async createArticle(input, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    // Validate input
    const errors = validateArticleInput(input);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map((e) => e.message).join(', ')}`);
    }

    // Create article with unique ID and default status "draft"
    const id = this._generateId();
    const article = createArticleObject(input, id);

    // Save to storage
    await this.storage.saveArticle(article);

    return article;
  }

  /**
   * Get a single article by ID.
   * 
   * @param {string} id - Article ID
   * @returns {Promise<object|null>} The Article or null if not found
   */
  async getArticle(id) {
    return await this.storage.getArticle(id);
  }

  /**
   * Get a single article by slug.
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  async getArticleBySlug(slug) {
    const articles = await this.storage.getAllArticles();
    return articles.find((a) => a.slug === slug) || null;
  }

  /**
   * Resolve an article by UUID or slug (for public routes).
   * @param {string} idOrSlug
   * @returns {Promise<object|null>}
   */
  async resolveArticle(idOrSlug) {
    const legacySlug = LEGACY_ID_TO_SLUG[idOrSlug];
    if (legacySlug) {
      const byLegacy = await this.getArticleBySlug(legacySlug);
      if (byLegacy) return byLegacy;
    }

    const byId = await this.getArticle(idOrSlug);
    if (byId) return byId;
    return this.getArticleBySlug(idOrSlug);
  }

  /**
   * Get all articles (admin view).
   * Requirements: 1.4
   * 
   * @param {object} options - Query options { sortBy, sortOrder, limit, offset }
   * @returns {Promise<Array>} Array of all articles
   */
  async getAllArticles(options = {}) {
    let articles = await this.storage.getAllArticles();

    // Apply sorting
    if (options.sortBy) {
      articles = this._sortArticles(articles, options.sortBy, options.sortOrder || 'desc');
    }

    // Apply pagination
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      articles = articles.slice(offset, offset + options.limit);
    }

    return articles;
  }

  /**
   * Get only published articles (public view).
   * Requirements: 1.5, 9.1, 9.2
   * 
   * @param {object} options - Query options { sortBy, sortOrder, limit, offset }
   * @returns {Promise<Array>} Array of published articles
   */
  async getPublishedArticles(options = {}) {
    let articles = await this.storage.getAllArticles();

    // Filter published only
    articles = articles.filter((a) => a.status === ARTICLE_STATUS.PUBLISHED);

    // Default sort by publishedAt descending (newest first)
    const sortBy = options.sortBy || 'publishedAt';
    const sortOrder = options.sortOrder || 'desc';
    articles = this._sortArticles(articles, sortBy, sortOrder);

    // Apply pagination
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      articles = articles.slice(offset, offset + options.limit);
    }

    return articles;
  }

  /**
   * Update an existing article.
   * Requirements: 1.2
   * 
   * @param {string} id - Article ID
   * @param {object} updates - Partial ArticleInput data
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<object>} The updated Article
   */
  async updateArticle(id, updates, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    const existing = await this.storage.getArticle(id);
    if (!existing) {
      throw new Error('Article non trouvé.');
    }

    // Validate updates
    const mergedInput = { ...existing, ...updates };
    const errors = validateArticleInput(mergedInput);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map((e) => e.message).join(', ')}`);
    }

    // Preserve identity, update timestamp
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(), // Update modification time
    };

    await this.storage.saveArticle(updated);
    return updated;
  }

  /**
   * Publish an article.
   * Requirements: 8.3
   * 
   * @param {string} id - Article ID
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<object>} The published Article
   */
  async publishArticle(id, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    const existing = await this.storage.getArticle(id);
    if (!existing) {
      throw new Error('Article non trouvé.');
    }

    const now = new Date().toISOString();
    const published = {
      ...existing,
      status: ARTICLE_STATUS.PUBLISHED,
      publishedAt: existing.publishedAt || now, // Set if null, preserve if already set
      updatedAt: now,
    };

    await this.storage.saveArticle(published);
    return published;
  }

  /**
   * Unpublish an article (revert to draft).
   * Requirements: 8.4
   * 
   * @param {string} id - Article ID
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<object>} The unpublished Article
   */
  async unpublishArticle(id, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    const existing = await this.storage.getArticle(id);
    if (!existing) {
      throw new Error('Article non trouvé.');
    }

    const unpublished = {
      ...existing,
      status: ARTICLE_STATUS.DRAFT,
      // Preserve publishedAt to maintain history
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveArticle(unpublished);
    return unpublished;
  }

  /**
   * Delete an article.
   * Requirements: 1.3
   * 
   * @param {string} id - Article ID
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<void>}
   */
  async deleteArticle(id, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    await this.storage.deleteArticle(id);
  }

  /**
   * Get articles by category.
   * Requirements: 3.6, 3.8
   * 
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of published articles in category
   */
  async getArticlesByCategory(category) {
    const articles = await this.getPublishedArticles();
    return articles.filter((a) => a.category === category);
  }

  /**
   * Get articles by tag.
   * Requirements: 3.7, 3.8
   * 
   * @param {string} tag - Tag name
   * @returns {Promise<Array>} Array of published articles with tag
   */
  async getArticlesByTag(tag) {
    const articles = await this.getPublishedArticles();
    return articles.filter((a) => a.tags && a.tags.includes(tag));
  }

  /**
   * Filter published articles by category, tag and/or search query.
   * Requirements: 4.4, 4.5, 10.5
   *
   * @param {object} filters
   * @param {string} [filters.category]
   * @param {string} [filters.tag]
   * @param {string} [filters.query]
   * @param {import('./searchService.js').SearchService} [filters.searchService]
   * @returns {Promise<Array>}
   */
  async filterPublishedArticles(filters = {}) {
    const { category, tag, query, searchService } = filters;
    let articles = await this.getPublishedArticles();

    if (category) {
      articles = articles.filter((a) => a.category === category);
    }

    if (tag) {
      articles = articles.filter((a) => a.tags && a.tags.includes(tag));
    }

    if (query && query.trim() && searchService) {
      const results = await searchService.searchFullText(query.trim());
      const matchedIds = new Set(results.map((r) => r.article.id));
      articles = articles.filter((a) => matchedIds.has(a.id));
    }

    return articles;
  }

  /**
   * Get suggested related articles based on category or shared tags.
   * Requirements: 9.7
   *
   * @param {string} articleId
   * @param {number} [limit=4]
   * @returns {Promise<Array>}
   */
  async getSuggestedRelatedArticles(articleId, limit = 4) {
    const current = await this.getArticle(articleId);
    if (!current) return [];

    const published = await this.getPublishedArticles();
    const currentTags = new Set(current.tags || []);

    return published
      .filter((a) => a.id !== articleId)
      .filter(
        (a) =>
          a.category === current.category ||
          (a.tags && a.tags.some((t) => currentTags.has(t)))
      )
      .slice(0, limit);
  }

  /**
   * Sort articles by a field.
   * @private
   */
  _sortArticles(articles, sortBy, sortOrder = 'desc') {
    const sorted = [...articles].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'date' || sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Save multiple articles (for migration).
   * Requirements: 10.2
   * 
   * @param {Array} articles - Array of Article objects
   * @param {object} options - Optional settings { skipAuth: boolean }
   * @returns {Promise<void>}
   */
  async saveMultipleArticles(articles, options = {}) {
    if (!options.skipAuth) {
      this._checkAdminRole();
    }

    await this.storage.saveMultipleArticles(articles);
  }
}

export default ArticleService;
