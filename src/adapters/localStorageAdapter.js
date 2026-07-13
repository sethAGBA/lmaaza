/**
 * LocalStorage implementation of StorageAdapter for the L'Maaza dynamic blog system.
 * Requirements: 10.1, 10.6, 10.8
 */

import { StorageAdapter, StorageError, STORAGE_ERROR_CODES } from './storageAdapter.js';

const ARTICLE_KEY = 'lmaaza_blog_articles';
const MEDIA_KEY = 'lmaaza_blog_media';

/**
 * LocalStorageAdapter implements persistent storage using browser localStorage.
 */
export class LocalStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this._checkAvailability();
  }

  /**
   * Check if localStorage is available.
   * @private
   */
  _checkAvailability() {
    try {
      const testKey = '__lmaaza_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      throw new StorageError(
        'Le système de stockage est indisponible. Les données ne seront pas conservées.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        false
      );
    }
  }

  /**
   * Get current storage usage information.
   * @returns {{ used: number, available: number, percentUsed: number }}
   */
  getStorageInfo() {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      // Approximate localStorage limit (typically 5-10MB)
      const available = 5 * 1024 * 1024; // 5MB conservative estimate
      return {
        used,
        available,
        percentUsed: Math.round((used / available) * 100),
      };
    } catch (e) {
      return { used: 0, available: 0, percentUsed: 0 };
    }
  }

  /**
   * Check if approaching storage quota (>80%).
   * @returns {boolean}
   */
  isApproachingQuota() {
    const info = this.getStorageInfo();
    return info.percentUsed >= 80;
  }

  // ===== Article Methods =====

  async saveArticle(article) {
    try {
      const articles = await this.getAllArticles();
      const index = articles.findIndex((a) => a.id === article.id);

      if (index >= 0) {
        articles[index] = article;
      } else {
        articles.push(article);
      }

      localStorage.setItem(ARTICLE_KEY, JSON.stringify(articles));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        throw new StorageError(
          "Espace de stockage presque plein. Veuillez supprimer d'anciens articles ou contacter l'administrateur.",
          STORAGE_ERROR_CODES.QUOTA_EXCEEDED,
          true
        );
      }
      throw new StorageError(
        'Erreur lors de la sauvegarde de l\'article.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async getArticle(id) {
    try {
      const articles = await this.getAllArticles();
      return articles.find((a) => a.id === id) || null;
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la récupération de l\'article.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async getAllArticles() {
    try {
      const data = localStorage.getItem(ARTICLE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la récupération des articles.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async deleteArticle(id) {
    try {
      const articles = await this.getAllArticles();
      const filtered = articles.filter((a) => a.id !== id);
      localStorage.setItem(ARTICLE_KEY, JSON.stringify(filtered));
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la suppression de l\'article.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  // ===== Media Methods =====

  async saveMedia(media) {
    try {
      const mediaList = await this.getAllMedia();
      const index = mediaList.findIndex((m) => m.id === media.id);

      if (index >= 0) {
        mediaList[index] = media;
      } else {
        mediaList.push(media);
      }

      localStorage.setItem(MEDIA_KEY, JSON.stringify(mediaList));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        throw new StorageError(
          "Espace de stockage presque plein. Veuillez supprimer d'anciens médias.",
          STORAGE_ERROR_CODES.QUOTA_EXCEEDED,
          true
        );
      }
      throw new StorageError(
        'Erreur lors de la sauvegarde du média.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async getMedia(id) {
    try {
      const mediaList = await this.getAllMedia();
      return mediaList.find((m) => m.id === id) || null;
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la récupération du média.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async getAllMedia() {
    try {
      const data = localStorage.getItem(MEDIA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la récupération des médias.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  async deleteMedia(id) {
    try {
      const mediaList = await this.getAllMedia();
      const filtered = mediaList.filter((m) => m.id !== id);
      localStorage.setItem(MEDIA_KEY, JSON.stringify(filtered));
    } catch (e) {
      throw new StorageError(
        'Erreur lors de la suppression du média.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  // ===== Batch Operations =====

  async saveMultipleArticles(articles) {
    try {
      const existing = await this.getAllArticles();
      const existingMap = new Map(existing.map((a) => [a.id, a]));

      articles.forEach((article) => {
        existingMap.set(article.id, article);
      });

      const merged = Array.from(existingMap.values());
      localStorage.setItem(ARTICLE_KEY, JSON.stringify(merged));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        throw new StorageError(
          "Espace de stockage presque plein. Veuillez supprimer d'anciens articles.",
          STORAGE_ERROR_CODES.QUOTA_EXCEEDED,
          true
        );
      }
      throw new StorageError(
        'Erreur lors de la sauvegarde multiple des articles.',
        STORAGE_ERROR_CODES.UNAVAILABLE,
        true
      );
    }
  }

  /**
   * Clear all stored data (for testing purposes).
   */
  async clearAll() {
    localStorage.removeItem(ARTICLE_KEY);
    localStorage.removeItem(MEDIA_KEY);
  }
}

export default LocalStorageAdapter;
