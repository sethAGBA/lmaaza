/**
 * Storage Adapter Interface for the L'Maaza dynamic blog system.
 * This interface defines the contract for storage implementations.
 * Requirements: 10.1, 10.6, 10.8
 */

/**
 * StorageAdapter Interface
 * All storage implementations must implement these methods.
 */
export class StorageAdapter {
  // Articles
  async saveArticle(article) {
    throw new Error('saveArticle must be implemented');
  }

  async getArticle(id) {
    throw new Error('getArticle must be implemented');
  }

  async getAllArticles() {
    throw new Error('getAllArticles must be implemented');
  }

  async deleteArticle(id) {
    throw new Error('deleteArticle must be implemented');
  }

  // Media
  async saveMedia(media) {
    throw new Error('saveMedia must be implemented');
  }

  async getMedia(id) {
    throw new Error('getMedia must be implemented');
  }

  async getAllMedia() {
    throw new Error('getAllMedia must be implemented');
  }

  async deleteMedia(id) {
    throw new Error('deleteMedia must be implemented');
  }

  // Batch operations
  async saveMultipleArticles(articles) {
    throw new Error('saveMultipleArticles must be implemented');
  }
}

/**
 * Storage Error classes for error handling.
 */
export class StorageError extends Error {
  constructor(message, code, recoverable = false) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

export const STORAGE_ERROR_CODES = {
  QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  UNAVAILABLE: 'STORAGE_UNAVAILABLE',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
};
