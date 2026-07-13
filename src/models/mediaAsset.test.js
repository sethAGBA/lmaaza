/**
 * Unit tests for MediaAsset model and validation.
 */

import {
  VALID_IMAGE_TYPES,
  VALID_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  createMediaAssetObject,
  validateMediaAssetInput,
  isValidImageType,
  isValidVideoType,
} from './mediaAsset';

describe('MediaAsset Model', () => {
  describe('createMediaAssetObject', () => {
    it('should create a media asset with all required fields', () => {
      const input = {
        type: 'image',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 100000,
        url: 'data:image/jpeg;base64,...',
        altText: 'Test image',
      };
      const id = 'media-id-123';

      const asset = createMediaAssetObject(input, id);

      expect(asset.id).toBe(id);
      expect(asset.type).toBe(input.type);
      expect(asset.fileName).toBe(input.fileName);
      expect(asset.mimeType).toBe(input.mimeType);
      expect(asset.size).toBe(input.size);
      expect(asset.url).toBe(input.url);
      expect(asset.altText).toBe(input.altText);
      expect(asset.createdAt).toBeDefined();
    });
  });

  describe('validateMediaAssetInput', () => {
    const validImageInput = {
      type: 'image',
      fileName: 'test.jpg',
      mimeType: 'image/jpeg',
      size: 1000000, // 1MB
      url: 'data:image/jpeg;base64,...',
      altText: 'Test image',
    };

    const validVideoInput = {
      type: 'video',
      fileName: 'test.mp4',
      mimeType: 'video/mp4',
      size: 10000000, // 10MB
      url: 'data:video/mp4;base64,...',
    };

    it('should return no errors for valid image input', () => {
      const errors = validateMediaAssetInput(validImageInput);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for valid video input', () => {
      const errors = validateMediaAssetInput(validVideoInput);
      expect(errors).toHaveLength(0);
    });

    it('should require altText for images', () => {
      const input = { ...validImageInput, altText: '' };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'altText')).toBe(true);
    });

    it('should not require altText for videos', () => {
      const errors = validateMediaAssetInput(validVideoInput);
      expect(errors.some((e) => e.field === 'altText')).toBe(false);
    });

    it('should reject invalid image MIME types', () => {
      const input = { ...validImageInput, mimeType: 'image/bmp' };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'mimeType' && e.code === 'INVALID_FORMAT')).toBe(true);
    });

    it('should reject invalid video MIME types', () => {
      const input = { ...validVideoInput, mimeType: 'video/avi' };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'mimeType' && e.code === 'INVALID_FORMAT')).toBe(true);
    });

    it('should accept all valid image MIME types', () => {
      VALID_IMAGE_TYPES.forEach((mimeType) => {
        const input = { ...validImageInput, mimeType };
        const errors = validateMediaAssetInput(input);
        expect(errors.filter((e) => e.field === 'mimeType')).toHaveLength(0);
      });
    });

    it('should accept all valid video MIME types', () => {
      VALID_VIDEO_TYPES.forEach((mimeType) => {
        const input = { ...validVideoInput, mimeType };
        const errors = validateMediaAssetInput(input);
        expect(errors.filter((e) => e.field === 'mimeType')).toHaveLength(0);
      });
    });

    it('should reject image files over 10MB', () => {
      const input = { ...validImageInput, size: MAX_IMAGE_SIZE + 1 };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'size' && e.code === 'FILE_TOO_LARGE')).toBe(true);
    });

    it('should reject video files over 50MB', () => {
      const input = { ...validVideoInput, size: MAX_VIDEO_SIZE + 1 };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'size' && e.code === 'FILE_TOO_LARGE')).toBe(true);
    });

    it('should require url', () => {
      const input = { ...validImageInput, url: '' };
      const errors = validateMediaAssetInput(input);
      expect(errors.some((e) => e.field === 'url')).toBe(true);
    });
  });

  describe('isValidImageType', () => {
    it('should return true for valid image types', () => {
      VALID_IMAGE_TYPES.forEach((mimeType) => {
        expect(isValidImageType(mimeType)).toBe(true);
      });
    });

    it('should return false for invalid image types', () => {
      expect(isValidImageType('image/bmp')).toBe(false);
      expect(isValidImageType('video/mp4')).toBe(false);
      expect(isValidImageType('')).toBe(false);
    });
  });

  describe('isValidVideoType', () => {
    it('should return true for valid video types', () => {
      VALID_VIDEO_TYPES.forEach((mimeType) => {
        expect(isValidVideoType(mimeType)).toBe(true);
      });
    });

    it('should return false for invalid video types', () => {
      expect(isValidVideoType('video/avi')).toBe(false);
      expect(isValidVideoType('image/jpeg')).toBe(false);
      expect(isValidVideoType('')).toBe(false);
    });
  });
});
