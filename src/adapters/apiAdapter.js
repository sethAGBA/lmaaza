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

  // 404 retourne null — pas une erreur
  if (response.status === 404) return null;

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
    const data = await apiFetch(`/api/articles/${encodeURIComponent(id)}`);
    return data ? (data.article || null) : null;
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
    const data = await apiFetch(`/api/media/${encodeURIComponent(id)}`);
    return data ? (data.asset || null) : null;
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
