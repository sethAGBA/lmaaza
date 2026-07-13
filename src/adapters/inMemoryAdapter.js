/**
 * In-memory storage adapter for testing.
 * This adapter is used in tests instead of LocalStorageAdapter to avoid
 * browser-specific dependencies.
 */

import { StorageAdapter } from './storageAdapter.js';

export class InMemoryAdapter extends StorageAdapter {
  constructor() {
    super();
    this._articles = new Map();
    this._media = new Map();
  }

  async saveArticle(article) {
    this._articles.set(article.id, { ...article });
  }

  async getArticle(id) {
    return this._articles.has(id) ? { ...this._articles.get(id) } : null;
  }

  async getAllArticles() {
    return Array.from(this._articles.values()).map((a) => ({ ...a }));
  }

  async deleteArticle(id) {
    this._articles.delete(id);
  }

  async saveMedia(media) {
    this._media.set(media.id, { ...media });
  }

  async getMedia(id) {
    return this._media.has(id) ? { ...this._media.get(id) } : null;
  }

  async getAllMedia() {
    return Array.from(this._media.values()).map((m) => ({ ...m }));
  }

  async deleteMedia(id) {
    this._media.delete(id);
  }

  async saveMultipleArticles(articles) {
    articles.forEach((article) => {
      this._articles.set(article.id, { ...article });
    });
  }

  async clearAll() {
    this._articles.clear();
    this._media.clear();
  }
}

export default InMemoryAdapter;
