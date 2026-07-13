/**
 * MediaService provides upload and management operations for media assets.
 * Requirements: 5.1, 5.2, 5.6
 */

import { v4 as uuidv4 } from 'uuid';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Valid image MIME types (Requirements 5.1) */
export const VALID_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

/** Valid video MIME types (Requirements 5.2) */
export const VALID_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
]);

/** Max file size: 10 MB for images (in bytes) */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/** Max file size: 50 MB for videos (in bytes) */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

/** Error codes for MediaUploadError */
export const MEDIA_ERROR_CODES = {
  INVALID_FORMAT: 'INVALID_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
};

// ─── Error Class ─────────────────────────────────────────────────────────────

/**
 * MediaUploadError is thrown when a media upload fails validation or processing.
 */
export class MediaUploadError extends Error {
  /**
   * @param {string} message - Human-readable error message (in French)
   * @param {'INVALID_FORMAT'|'FILE_TOO_LARGE'|'UPLOAD_FAILED'} code - Machine-readable error code
   * @param {File} [file] - The file that caused the error (optional)
   */
  constructor(message, code, file = undefined) {
    super(message);
    this.name = 'MediaUploadError';
    this.code = code;
    this.file = file;
  }
}

// ─── MediaService ─────────────────────────────────────────────────────────────

/**
 * MediaService manages media asset uploads and storage.
 */
export class MediaService {
  /**
   * @param {import('../adapters/storageAdapter.js').StorageAdapter} storageAdapter
   */
  constructor(storageAdapter) {
    this.storage = storageAdapter;
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Generate a new UUID.
   * @returns {string}
   * @private
   */
  _generateId() {
    return uuidv4();
  }

  /**
   * Validate that a file's MIME type is in the allowed set.
   * @param {File} file
   * @param {Set<string>} allowedTypes
   * @throws {MediaUploadError} if format is invalid
   * @private
   */
  _validateFormat(file, allowedTypes) {
    const mimeType = (file.type || '').toLowerCase();
    if (!allowedTypes.has(mimeType)) {
      throw new MediaUploadError(
        'Format de fichier non supporté. Formats acceptés : PNG, JPEG, WebP, GIF, SVG pour les images ; MP4, WebM, OGG pour les vidéos.',
        MEDIA_ERROR_CODES.INVALID_FORMAT,
        file
      );
    }
  }

  /**
   * Validate that a file's size does not exceed the maximum.
   * @param {File} file
   * @param {number} maxBytes
   * @param {string} label - Human-readable limit for error messages (e.g. "10 Mo")
   * @throws {MediaUploadError} if file is too large
   * @private
   */
  _validateSize(file, maxBytes, label) {
    if (file.size > maxBytes) {
      throw new MediaUploadError(
        `Le fichier dépasse la taille maximale autorisée (${label}).`,
        MEDIA_ERROR_CODES.FILE_TOO_LARGE,
        file
      );
    }
  }

  /**
   * Read a File as a base64 data URL.
   * @param {File} file
   * @returns {Promise<string>} data URL
   * @private
   */
  _readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // Attach handlers BEFORE calling read so synchronous mocks fire correctly
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = () =>
        reject(
          new MediaUploadError(
            "L'upload a échoué. Veuillez réessayer.",
            MEDIA_ERROR_CODES.UPLOAD_FAILED,
            file
          )
        );
      // Start the read after handlers are registered
      reader.readAsDataURL(file);
    });
  }

  /**
   * Determine image dimensions from a data URL.
   * Returns null when running in a non-browser environment (e.g. Node.js/Jest)
   * or when the image cannot be loaded within a reasonable timeout.
   * @param {string} dataUrl
   * @returns {Promise<{width: number, height: number}|null>}
   * @private
   */
  _getImageDimensions(dataUrl) {
    // Guard: Image constructor not available (Node environment)
    if (typeof Image === 'undefined') {
      return Promise.resolve(null);
    }

    const loadPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });

    // Safety timeout — jsdom's Image may never fire onload/onerror for data URLs.
    // Fall back to null after 200 ms so uploads are never blocked.
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve(null), 200)
    );

    return Promise.race([loadPromise, timeoutPromise]);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Upload an image file, validate it, store it and return the MediaAsset.
   * Requirements: 5.1, 5.6
   *
   * @param {File} file - The image file to upload
   * @param {string} [altText] - Accessibility description
   * @returns {Promise<import('../models/mediaAsset.js').MediaAsset>}
   * @throws {MediaUploadError}
   */
  async uploadImage(file, altText = '') {
    // Validate format
    this._validateFormat(file, VALID_IMAGE_MIME_TYPES);

    // Validate size (10 MB)
    this._validateSize(file, MAX_IMAGE_SIZE, '10 Mo');

    let url;
    try {
      url = await this._readAsDataURL(file);
    } catch (err) {
      if (err instanceof MediaUploadError) throw err;
      throw new MediaUploadError(
        "L'upload a échoué. Veuillez réessayer.",
        MEDIA_ERROR_CODES.UPLOAD_FAILED,
        file
      );
    }

    // Try to extract image dimensions (best-effort; may be null in tests/SSR)
    const dimensions = await this._getImageDimensions(url);

    /** @type {import('../models/mediaAsset.js').MediaAsset} */
    const asset = {
      id: this._generateId(),
      type: 'image',
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      altText: altText || '',
      ...(dimensions ? { dimensions } : {}),
      createdAt: new Date().toISOString(),
    };

    try {
      await this.storage.saveMedia(asset);
    } catch (err) {
      throw new MediaUploadError(
        "L'upload a échoué. Veuillez réessayer.",
        MEDIA_ERROR_CODES.UPLOAD_FAILED,
        file
      );
    }

    return asset;
  }

  /**
   * Upload a video file, validate it, store it and return the MediaAsset.
   * Requirements: 5.2, 5.6
   *
   * @param {File} file - The video file to upload
   * @returns {Promise<import('../models/mediaAsset.js').MediaAsset>}
   * @throws {MediaUploadError}
   */
  async uploadVideo(file) {
    // Validate format
    this._validateFormat(file, VALID_VIDEO_MIME_TYPES);

    // Validate size (50 MB)
    this._validateSize(file, MAX_VIDEO_SIZE, '50 Mo');

    let url;
    try {
      url = await this._readAsDataURL(file);
    } catch (err) {
      if (err instanceof MediaUploadError) throw err;
      throw new MediaUploadError(
        "L'upload a échoué. Veuillez réessayer.",
        MEDIA_ERROR_CODES.UPLOAD_FAILED,
        file
      );
    }

    /** @type {import('../models/mediaAsset.js').MediaAsset} */
    const asset = {
      id: this._generateId(),
      type: 'video',
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      createdAt: new Date().toISOString(),
    };

    try {
      await this.storage.saveMedia(asset);
    } catch (err) {
      throw new MediaUploadError(
        "L'upload a échoué. Veuillez réessayer.",
        MEDIA_ERROR_CODES.UPLOAD_FAILED,
        file
      );
    }

    return asset;
  }

  /**
   * Retrieve a media asset by ID.
   *
   * @param {string} id - Media asset UUID
   * @returns {Promise<import('../models/mediaAsset.js').MediaAsset|null>}
   */
  async getMedia(id) {
    return await this.storage.getMedia(id);
  }

  /**
   * Delete a media asset by ID.
   *
   * @param {string} id - Media asset UUID
   * @returns {Promise<void>}
   */
  async deleteMedia(id) {
    await this.storage.deleteMedia(id);
  }

  /**
   * Retrieve all media assets.
   *
   * @returns {Promise<import('../models/mediaAsset.js').MediaAsset[]>}
   */
  async getAllMedia() {
    return await this.storage.getAllMedia();
  }

  // ── Validation Helpers (exposed for property-based tests) ──────────────────

  /**
   * Check whether a MIME type is a valid image format.
   * Requirements: 5.1
   *
   * @param {string} mimeType
   * @returns {boolean}
   */
  static isValidImageMimeType(mimeType) {
    return VALID_IMAGE_MIME_TYPES.has((mimeType || '').toLowerCase());
  }

  /**
   * Check whether a MIME type is a valid video format.
   * Requirements: 5.2
   *
   * @param {string} mimeType
   * @returns {boolean}
   */
  static isValidVideoMimeType(mimeType) {
    return VALID_VIDEO_MIME_TYPES.has((mimeType || '').toLowerCase());
  }
}

export default MediaService;
