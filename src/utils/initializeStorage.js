/**
 * initializeStorage.js
 *
 * Initializes the blog's localStorage with migrated articles on first load.
 * This utility is idempotent: it checks whether articles already exist before
 * running the migration, so it is safe to call on every app startup.
 *
 * Requirements: 10.2, 10.6
 *
 * Usage (e.g. in src/index.js, before rendering):
 *   import { initializeStorage } from './utils/initializeStorage.js';
 *   await initializeStorage();
 */

import { migrateArticles } from '../migration/migrateBlogData.js';
import { LocalStorageAdapter } from '../adapters/localStorageAdapter.js';
import { ApiAdapter } from '../adapters/apiAdapter.js';

// Shared adapter instance (singleton for this module)
let _adapter = null;

/**
 * Get or create the adapter instance.
 * En production → ApiAdapter (Vercel KV), en dev → LocalStorageAdapter.
 */
function getAdapter() {
  if (!_adapter) {
    _adapter =
      process.env.NODE_ENV === 'production'
        ? new ApiAdapter()
        : new LocalStorageAdapter();
  }
  return _adapter;
}

/**
 * Initialize localStorage with migrated blog articles.
 *
 * Behavior:
 *  - If articles already exist in localStorage, does nothing (idempotent).
 *  - If localStorage is empty, runs the migration and persists the result.
 *
 * @param {object}  [options]
 * @param {boolean} [options.force=false]  Force re-migration even if data exists.
 * @param {object}  [options.adapter]      Override the storage adapter (for testing).
 * @returns {Promise<{ initialized: boolean, count: number }>}
 *   initialized: true if migration was actually run, false if data already existed.
 *   count: number of articles now present in storage.
 */
export async function initializeStorage(options = {}) {
  const { force = false, adapter: adapterOverride } = options;
  const adapter = adapterOverride || getAdapter();

  try {
    // Check if articles already exist
    const existing = await adapter.getAllArticles();

    if (existing.length > 0 && !force) {
      // Data already present — nothing to do
      return { initialized: false, count: existing.length };
    }

    // En production avec ApiAdapter, la migration est gérée côté serveur.
    // Le client ne peut pas écrire sans token admin.
    if (process.env.NODE_ENV === 'production') {
      return { initialized: false, count: existing.length };
    }

    // Run migration and persist articles (dev only)
    const migrated = migrateArticles();
    await adapter.saveMultipleArticles(migrated);

    return { initialized: true, count: migrated.length };
  } catch (error) {
    // Storage may be unavailable (private browsing, quota exceeded, etc.)
    console.error('[initializeStorage] Failed to initialize blog storage:', error);
    throw error;
  }
}

/**
 * Check whether the blog storage has been initialized (has at least one article).
 *
 * @param {object} [options]
 * @param {object} [options.adapter]  Override the storage adapter (for testing).
 * @returns {Promise<boolean>}
 */
export async function isStorageInitialized(options = {}) {
  const { adapter: adapterOverride } = options;
  const adapter = adapterOverride || getAdapter();

  try {
    const articles = await adapter.getAllArticles();
    return articles.length > 0;
  } catch {
    return false;
  }
}

/**
 * Clear all blog data from localStorage.
 * Use with care — this removes all articles and media.
 *
 * @param {object} [options]
 * @param {object} [options.adapter]  Override the storage adapter (for testing).
 * @returns {Promise<void>}
 */
export async function clearStorage(options = {}) {
  const { adapter: adapterOverride } = options;
  const adapter = adapterOverride || getAdapter();
  await adapter.clearAll();
}
