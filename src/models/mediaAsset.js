/**
 * MediaAsset model and validation for the L'Maaza dynamic blog system.
 * Requirements: 5.1, 5.2, 5.6
 */

/**
 * Valid image MIME types.
 */
export const VALID_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Valid video MIME types.
 */
export const VALID_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
];

/**
 * File size limits in bytes.
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Image dimension constraints.
 */
export const MIN_IMAGE_WIDTH = 400;
export const MIN_IMAGE_HEIGHT = 300;
export const MAX_IMAGE_WIDTH = 4000;
export const MAX_IMAGE_HEIGHT = 4000;

/**
 * Creates a new MediaAsset object.
 *
 * @param {object} input - MediaAsset input fields
 * @param {string} id - UUID v4 for the asset
 * @returns {object} A new MediaAsset object
 */
export function createMediaAssetObject(input, id) {
  const now = new Date().toISOString();
  return {
    id,
    type: input.type,
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
    url: input.url,
    altText: input.altText || undefined,
    thumbnail: input.thumbnail || undefined,
    dimensions: input.dimensions || undefined,
    createdAt: now,
  };
}

/**
 * Validates a MediaAsset input object.
 * Returns an array of ValidationError objects (empty array = valid).
 *
 * @param {object} input - The media asset data to validate
 * @returns {Array<{field: string, message: string, code: string}>}
 */
export function validateMediaAssetInput(input) {
  const errors = [];

  if (!input) {
    errors.push({ field: 'input', message: 'Media input is required', code: 'REQUIRED' });
    return errors;
  }

  // type: required, must be 'image' or 'video'
  if (!input.type || !['image', 'video'].includes(input.type)) {
    errors.push({ field: 'type', message: 'Le type doit être "image" ou "video"', code: 'INVALID_VALUE' });
  }

  // fileName: required
  if (!input.fileName || typeof input.fileName !== 'string' || input.fileName.trim().length === 0) {
    errors.push({ field: 'fileName', message: 'Le nom de fichier est requis', code: 'REQUIRED' });
  }

  // mimeType: required and must be valid for type
  if (!input.mimeType) {
    errors.push({ field: 'mimeType', message: 'Le type MIME est requis', code: 'REQUIRED' });
  } else {
    if (input.type === 'image' && !VALID_IMAGE_TYPES.includes(input.mimeType)) {
      errors.push({
        field: 'mimeType',
        message: `Format de fichier non supporté. Formats acceptés : PNG, JPEG, WebP, GIF, SVG`,
        code: 'INVALID_FORMAT',
      });
    }
    if (input.type === 'video' && !VALID_VIDEO_TYPES.includes(input.mimeType)) {
      errors.push({
        field: 'mimeType',
        message: `Format de vidéo non supporté. Formats acceptés : MP4, WebM, OGG`,
        code: 'INVALID_FORMAT',
      });
    }
  }

  // size: required and must respect limits
  if (typeof input.size !== 'number' || input.size <= 0) {
    errors.push({ field: 'size', message: 'La taille du fichier est requise et doit être positive', code: 'REQUIRED' });
  } else {
    if (input.type === 'image' && input.size > MAX_IMAGE_SIZE) {
      errors.push({
        field: 'size',
        message: `Le fichier dépasse la taille maximale autorisée (10 Mo pour les images)`,
        code: 'FILE_TOO_LARGE',
      });
    }
    if (input.type === 'video' && input.size > MAX_VIDEO_SIZE) {
      errors.push({
        field: 'size',
        message: `Le fichier dépasse la taille maximale autorisée (50 Mo pour les vidéos)`,
        code: 'FILE_TOO_LARGE',
      });
    }
  }

  // url: required
  if (!input.url || typeof input.url !== 'string' || input.url.trim().length === 0) {
    errors.push({ field: 'url', message: "L'URL est requise", code: 'REQUIRED' });
  }

  // altText: required for images (accessibility requirement 5.6)
  if (input.type === 'image' && (!input.altText || input.altText.trim().length === 0)) {
    errors.push({ field: 'altText', message: "Le texte alternatif est requis pour les images (accessibilité)", code: 'REQUIRED' });
  }

  // dimensions: validate if provided for images
  if (input.dimensions) {
    if (typeof input.dimensions.width !== 'number' || typeof input.dimensions.height !== 'number') {
      errors.push({ field: 'dimensions', message: 'Les dimensions doivent contenir width et height numériques', code: 'INVALID_FORMAT' });
    } else {
      if (input.dimensions.width < MIN_IMAGE_WIDTH || input.dimensions.height < MIN_IMAGE_HEIGHT) {
        errors.push({
          field: 'dimensions',
          message: `Les dimensions minimales sont ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}`,
          code: 'INVALID_VALUE',
        });
      }
      if (input.dimensions.width > MAX_IMAGE_WIDTH || input.dimensions.height > MAX_IMAGE_HEIGHT) {
        errors.push({
          field: 'dimensions',
          message: `Les dimensions maximales sont ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}`,
          code: 'INVALID_VALUE',
        });
      }
    }
  }

  return errors;
}

/**
 * Validates an image MIME type.
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isValidImageType(mimeType) {
  return VALID_IMAGE_TYPES.includes(mimeType);
}

/**
 * Validates a video MIME type.
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isValidVideoType(mimeType) {
  return VALID_VIDEO_TYPES.includes(mimeType);
}
