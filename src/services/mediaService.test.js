/**
 * Unit tests for MediaService.
 * Tests cover format validation, size validation, upload, and storage round-trips.
 * Requirements: 5.1, 5.2, 5.6
 */

import {
  MediaService,
  MediaUploadError,
  MEDIA_ERROR_CODES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  VALID_IMAGE_MIME_TYPES,
  VALID_VIDEO_MIME_TYPES,
} from './mediaService.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Create a minimal File-like object for testing.
 * jsdom does not expose a real FileReader that returns data URLs, so we
 * substitute a mock reader in the tests that exercise the upload path.
 */
function makeFile(name, type, sizeBytes = 1024) {
  // Build a small Uint8Array to back the blob
  const buf = new Uint8Array(sizeBytes);
  const blob = new Blob([buf], { type });
  Object.defineProperty(blob, 'name', { value: name, writable: false });
  // Blob doesn't have .name, so we cast to File by patching the object
  const file = new File([buf], name, { type });
  // Enforce exact size
  Object.defineProperty(file, 'size', { value: sizeBytes, writable: false });
  return file;
}

/**
 * Build a mock StorageAdapter with in-memory storage.
 */
function makeStorageAdapter() {
  const store = new Map();
  return {
    store,
    async saveMedia(media) {
      store.set(media.id, media);
    },
    async getMedia(id) {
      return store.get(id) ?? null;
    },
    async getAllMedia() {
      return Array.from(store.values());
    },
    async deleteMedia(id) {
      store.delete(id);
    },
  };
}

/**
 * Patch FileReader on the global to return a deterministic data URL so we
 * don't depend on jsdom's incomplete FileReader implementation.
 *
 * Uses a microtask (Promise.resolve) so the caller has time to attach
 * onload/onerror before the callback fires — matching real async behaviour.
 */
function mockFileReaderWith(dataUrl) {
  const OriginalFileReader = global.FileReader;
  const MockFileReader = jest.fn().mockImplementation(() => {
    const instance = {
      onload: null,
      onerror: null,
      result: null,
      readAsDataURL: jest.fn(function () {
        instance.result = dataUrl;
        // Defer so handlers attached synchronously after readAsDataURL() fire
        Promise.resolve().then(() => {
          if (typeof instance.onload === 'function') {
            instance.onload({ target: { result: dataUrl } });
          }
        });
      }),
    };
    return instance;
  });
  global.FileReader = MockFileReader;
  return () => {
    global.FileReader = OriginalFileReader;
  };
}

/**
 * Patch FileReader to simulate a read error.
 */
function mockFileReaderError() {
  const OriginalFileReader = global.FileReader;
  const MockFileReader = jest.fn().mockImplementation(() => {
    const instance = {
      onload: null,
      onerror: null,
      result: null,
      readAsDataURL: jest.fn(function () {
        Promise.resolve().then(() => {
          if (typeof instance.onerror === 'function') {
            instance.onerror(new Error('read error'));
          }
        });
      }),
    };
    return instance;
  });
  global.FileReader = MockFileReader;
  return () => {
    global.FileReader = OriginalFileReader;
  };
}

// ─── Static validation helpers ────────────────────────────────────────────────

describe('MediaService.isValidImageMimeType', () => {
  it.each([...VALID_IMAGE_MIME_TYPES])(
    'accepts valid image type: %s',
    (mime) => {
      expect(MediaService.isValidImageMimeType(mime)).toBe(true);
    }
  );

  it.each(['video/mp4', 'video/webm', 'application/pdf', 'text/plain', ''])(
    'rejects non-image type: %s',
    (mime) => {
      expect(MediaService.isValidImageMimeType(mime)).toBe(false);
    }
  );
});

describe('MediaService.isValidVideoMimeType', () => {
  it.each([...VALID_VIDEO_MIME_TYPES])(
    'accepts valid video type: %s',
    (mime) => {
      expect(MediaService.isValidVideoMimeType(mime)).toBe(true);
    }
  );

  it.each(['image/png', 'image/jpeg', 'application/pdf', 'text/plain', ''])(
    'rejects non-video type: %s',
    (mime) => {
      expect(MediaService.isValidVideoMimeType(mime)).toBe(false);
    }
  );
});

// ─── uploadImage ──────────────────────────────────────────────────────────────

describe('MediaService.uploadImage', () => {
  let service;
  let adapter;

  beforeEach(() => {
    adapter = makeStorageAdapter();
    service = new MediaService(adapter);
  });

  it('throws MediaUploadError(INVALID_FORMAT) for an unsupported image MIME type', async () => {
    const file = makeFile('clip.mp4', 'video/mp4', 500);
    await expect(service.uploadImage(file)).rejects.toMatchObject({
      name: 'MediaUploadError',
      code: MEDIA_ERROR_CODES.INVALID_FORMAT,
    });
  });

  it('throws MediaUploadError(FILE_TOO_LARGE) when image exceeds 10 MB', async () => {
    const file = makeFile('big.png', 'image/png', MAX_IMAGE_SIZE + 1);
    await expect(service.uploadImage(file)).rejects.toMatchObject({
      name: 'MediaUploadError',
      code: MEDIA_ERROR_CODES.FILE_TOO_LARGE,
    });
  });

  it('accepts an image exactly at the 10 MB limit', async () => {
    const fakeDataUrl = 'data:image/png;base64,abc123';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('exact.png', 'image/png', MAX_IMAGE_SIZE);
      const asset = await service.uploadImage(file, 'alt text');
      expect(asset.type).toBe('image');
      expect(asset.size).toBe(MAX_IMAGE_SIZE);
    } finally {
      restore();
    }
  });

  it('throws MediaUploadError(UPLOAD_FAILED) when FileReader errors', async () => {
    const restore = mockFileReaderError();
    try {
      const file = makeFile('photo.png', 'image/png', 1024);
      await expect(service.uploadImage(file)).rejects.toMatchObject({
        name: 'MediaUploadError',
        code: MEDIA_ERROR_CODES.UPLOAD_FAILED,
      });
    } finally {
      restore();
    }
  });

  it('returns a MediaAsset with all required fields and saves to storage', async () => {
    const fakeDataUrl = 'data:image/jpeg;base64,xyz';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('photo.jpg', 'image/jpeg', 2048);
      const asset = await service.uploadImage(file, 'Une belle photo');

      // Required fields
      expect(typeof asset.id).toBe('string');
      expect(asset.id).toHaveLength(36); // UUID v4
      expect(asset.type).toBe('image');
      expect(asset.fileName).toBe('photo.jpg');
      expect(asset.mimeType).toBe('image/jpeg');
      expect(asset.size).toBe(2048);
      expect(asset.url).toBe(fakeDataUrl);
      expect(asset.altText).toBe('Une belle photo');
      expect(typeof asset.createdAt).toBe('string');
      expect(new Date(asset.createdAt).toISOString()).toBe(asset.createdAt);

      // Stored in adapter
      const stored = await adapter.getMedia(asset.id);
      expect(stored).toEqual(asset);
    } finally {
      restore();
    }
  });

  it('defaults altText to empty string when not provided', async () => {
    const fakeDataUrl = 'data:image/png;base64,abc';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('icon.png', 'image/png', 512);
      const asset = await service.uploadImage(file);
      expect(asset.altText).toBe('');
    } finally {
      restore();
    }
  });

  it('error messages are in French', async () => {
    const badFormatFile = makeFile('doc.pdf', 'application/pdf', 100);
    try {
      await service.uploadImage(badFormatFile);
    } catch (err) {
      expect(err.message).toMatch(/Format de fichier non support/);
    }

    const tooBigFile = makeFile('huge.png', 'image/png', MAX_IMAGE_SIZE + 1);
    try {
      await service.uploadImage(tooBigFile);
    } catch (err) {
      expect(err.message).toMatch(/taille maximale/);
    }
  });

  it.each([...VALID_IMAGE_MIME_TYPES])(
    'accepts every valid image format: %s',
    async (mime) => {
      const fakeDataUrl = `data:${mime};base64,abc`;
      const restore = mockFileReaderWith(fakeDataUrl);
      try {
        const ext = mime.split('/')[1].replace('+xml', '');
        const file = makeFile(`img.${ext}`, mime, 1024);
        const asset = await service.uploadImage(file);
        expect(asset.type).toBe('image');
        expect(asset.mimeType).toBe(mime);
      } finally {
        restore();
      }
    }
  );
});

// ─── uploadVideo ──────────────────────────────────────────────────────────────

describe('MediaService.uploadVideo', () => {
  let service;
  let adapter;

  beforeEach(() => {
    adapter = makeStorageAdapter();
    service = new MediaService(adapter);
  });

  it('throws MediaUploadError(INVALID_FORMAT) for an unsupported video MIME type', async () => {
    const file = makeFile('photo.png', 'image/png', 1024);
    await expect(service.uploadVideo(file)).rejects.toMatchObject({
      name: 'MediaUploadError',
      code: MEDIA_ERROR_CODES.INVALID_FORMAT,
    });
  });

  it('throws MediaUploadError(FILE_TOO_LARGE) when video exceeds 50 MB', async () => {
    const file = makeFile('film.mp4', 'video/mp4', MAX_VIDEO_SIZE + 1);
    await expect(service.uploadVideo(file)).rejects.toMatchObject({
      name: 'MediaUploadError',
      code: MEDIA_ERROR_CODES.FILE_TOO_LARGE,
    });
  });

  it('accepts a video exactly at the 50 MB limit', async () => {
    const fakeDataUrl = 'data:video/mp4;base64,abc123';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('exact.mp4', 'video/mp4', MAX_VIDEO_SIZE);
      const asset = await service.uploadVideo(file);
      expect(asset.type).toBe('video');
      expect(asset.size).toBe(MAX_VIDEO_SIZE);
    } finally {
      restore();
    }
  });

  it('returns a MediaAsset with all required fields and saves to storage', async () => {
    const fakeDataUrl = 'data:video/webm;base64,xyz';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('clip.webm', 'video/webm', 4096);
      const asset = await service.uploadVideo(file);

      expect(typeof asset.id).toBe('string');
      expect(asset.id).toHaveLength(36);
      expect(asset.type).toBe('video');
      expect(asset.fileName).toBe('clip.webm');
      expect(asset.mimeType).toBe('video/webm');
      expect(asset.size).toBe(4096);
      expect(asset.url).toBe(fakeDataUrl);
      expect(typeof asset.createdAt).toBe('string');
      expect(new Date(asset.createdAt).toISOString()).toBe(asset.createdAt);

      const stored = await adapter.getMedia(asset.id);
      expect(stored).toEqual(asset);
    } finally {
      restore();
    }
  });

  it('error messages are in French', async () => {
    const badFile = makeFile('photo.jpg', 'image/jpeg', 1024);
    try {
      await service.uploadVideo(badFile);
    } catch (err) {
      expect(err.message).toMatch(/Format de fichier non support/);
    }

    const hugeFile = makeFile('big.mp4', 'video/mp4', MAX_VIDEO_SIZE + 1);
    try {
      await service.uploadVideo(hugeFile);
    } catch (err) {
      expect(err.message).toMatch(/taille maximale/);
    }
  });

  it.each([...VALID_VIDEO_MIME_TYPES])(
    'accepts every valid video format: %s',
    async (mime) => {
      const fakeDataUrl = `data:${mime};base64,abc`;
      const restore = mockFileReaderWith(fakeDataUrl);
      try {
        const ext = mime.split('/')[1];
        const file = makeFile(`video.${ext}`, mime, 1024);
        const asset = await service.uploadVideo(file);
        expect(asset.type).toBe('video');
        expect(asset.mimeType).toBe(mime);
      } finally {
        restore();
      }
    }
  );
});

// ─── getMedia / deleteMedia / getAllMedia ──────────────────────────────────────

describe('MediaService – storage delegation', () => {
  let service;
  let adapter;

  beforeEach(() => {
    adapter = makeStorageAdapter();
    service = new MediaService(adapter);
  });

  it('getMedia returns null for unknown id', async () => {
    expect(await service.getMedia('nonexistent-id')).toBeNull();
  });

  it('deleteMedia removes an asset from storage', async () => {
    const fakeDataUrl = 'data:image/png;base64,aaa';
    const restore = mockFileReaderWith(fakeDataUrl);
    try {
      const file = makeFile('img.png', 'image/png', 512);
      const asset = await service.uploadImage(file);
      expect(await service.getMedia(asset.id)).not.toBeNull();
      await service.deleteMedia(asset.id);
      expect(await service.getMedia(asset.id)).toBeNull();
    } finally {
      restore();
    }
  });

  it('getAllMedia returns all uploaded assets', async () => {
    const fakeUrl1 = 'data:image/png;base64,aaa';
    const fakeUrl2 = 'data:video/mp4;base64,bbb';

    const restoreImg = mockFileReaderWith(fakeUrl1);
    const img = await service.uploadImage(makeFile('a.png', 'image/png', 512));
    restoreImg();

    const restoreVid = mockFileReaderWith(fakeUrl2);
    const vid = await service.uploadVideo(makeFile('b.mp4', 'video/mp4', 1024));
    restoreVid();

    const all = await service.getAllMedia();
    expect(all).toHaveLength(2);
    const ids = all.map((a) => a.id);
    expect(ids).toContain(img.id);
    expect(ids).toContain(vid.id);
  });

  it('each upload gets a unique UUID', async () => {
    const restore = mockFileReaderWith('data:image/png;base64,abc');
    try {
      const a = await service.uploadImage(makeFile('a.png', 'image/png', 100));
      const b = await service.uploadImage(makeFile('b.png', 'image/png', 100));
      expect(a.id).not.toBe(b.id);
    } finally {
      restore();
    }
  });
});

// ─── MediaUploadError ─────────────────────────────────────────────────────────

describe('MediaUploadError', () => {
  it('has correct name, message, and code', () => {
    const err = new MediaUploadError('test msg', MEDIA_ERROR_CODES.UPLOAD_FAILED);
    expect(err.name).toBe('MediaUploadError');
    expect(err.message).toBe('test msg');
    expect(err.code).toBe('UPLOAD_FAILED');
    expect(err instanceof Error).toBe(true);
  });

  it('stores the offending file when provided', () => {
    const file = makeFile('x.png', 'image/png', 100);
    const err = new MediaUploadError('bad', MEDIA_ERROR_CODES.INVALID_FORMAT, file);
    expect(err.file).toBe(file);
  });
});
