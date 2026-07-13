/**
 * ApiAdapter — implémente StorageAdapter via les routes API Vercel.
 * Utilisé en production pour persister les données dans Vercel KV.
 */

import { StorageAdapter, StorageError, STORAGE_ERROR_CODES } from './storageAdapter.js';

/**
 * Récupère le token JWT depuis le localStorage du navigateur.
 * @returns {string|null}
 */
function getAuthToken() {
  try {
    return localStorage.getItem('lmaaza_token') || null;
  } catch {
    return null;
  }
}

/**
 * Effectue une requête vers l'API avec gestion d'erreurs.
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new StorageError(
      body.error || `Erreur HTTP ${response.status}`,
      STORAGE_ERROR_CODES.UNAVAILABLE,
      response.status < 500
    );
  }

  return response.json();
}

export class ApiAdapter extends StorageAdapter {
  // ── Articles ───────────────────────────────────────────────────────────────

  async saveArticle(article) {
    await apiFetch('/api/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  }

  async getArticle(id) {
    try {
      const data = await apiFetch(`/api/articles/${encodeURIComponent(id)}`);
      return data.article || null;
    } catch (err) {
      if (err instanceof StorageError && err.message.includes('404')) return null;
      // Retourne null si non trouvé (404 traité comme absence)
      if (err?.message?.startsWith('Erreur HTTP 404')) return null;
      throw err;
    }
  }

  async getAllArticles() {
    const data = await apiFetch('/api/articles');
    return data.articles || [];
  }

  async deleteArticle(id) {
    await apiFetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ── Médias ─────────────────────────────────────────────────────────────────

  async saveMedia(asset) {
    await apiFetch('/api/media', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
  }

  async getMedia(id) {
    try {
      const data = await apiFetch(`/api/media/${encodeURIComponent(id)}`);
      return data.asset || null;
    } catch {
      return null;
    }
  }

  async getAllMedia() {
    const data = await apiFetch('/api/media');
    return data.media || [];
  }

  async deleteMedia(id) {
    await apiFetch(`/api/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ── Batch ──────────────────────────────────────────────────────────────────

  async saveMultipleArticles(articles) {
    // Sauvegarder séquentiellement pour éviter les conflits
    for (const article of articles) {
      await this.saveArticle(article);
    }
  }
}

export default ApiAdapter;
