import { describe, expect, it } from 'vitest';
import { supportedImageError, validateUploadImageFile } from '../imageValidation';

const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x01, 0xff, 0xd9]);
const pngBytes = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x49, 0x45, 0x4e, 0x44,
]);
const webpBytes = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x08, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
]);

describe('validateUploadImageFile', () => {
  it('accepts JPG, JPEG, PNG, and WEBP files with matching signatures', async () => {
    await expect(validateUploadImageFile(file('photo.jpg', 'image/jpeg', jpegBytes), 4)).resolves.toEqual({ valid: true });
    await expect(validateUploadImageFile(file('photo.jpeg', 'image/jpeg', jpegBytes), 4)).resolves.toEqual({ valid: true });
    await expect(validateUploadImageFile(file('photo.png', 'image/png', pngBytes), 4)).resolves.toEqual({ valid: true });
    await expect(validateUploadImageFile(file('photo.webp', 'image/webp', webpBytes), 4)).resolves.toEqual({ valid: true });
  });

  it('rejects unsupported MIME types and extensions', async () => {
    await expect(validateUploadImageFile(file('photo.gif', 'image/gif', new Uint8Array([0x47, 0x49, 0x46])), 4)).resolves.toMatchObject({ valid: false, error: supportedImageError });
    await expect(validateUploadImageFile(file('photo.svg', 'image/svg+xml', new TextEncoder().encode('<svg />')), 4)).resolves.toMatchObject({ valid: false, error: supportedImageError });
    await expect(validateUploadImageFile(file('photo.heic', 'image/heic', new Uint8Array([0x00])), 4)).resolves.toMatchObject({ valid: false, error: supportedImageError });
    await expect(validateUploadImageFile(file('photo.avif', 'image/avif', new Uint8Array([0x00])), 4)).resolves.toMatchObject({ valid: false, error: supportedImageError });
  });

  it('rejects mismatched extension, MIME type, and content', async () => {
    await expect(validateUploadImageFile(file('photo.jpg', 'image/png', pngBytes), 4)).resolves.toMatchObject({ valid: false });
    await expect(validateUploadImageFile(file('photo.png', 'image/png', jpegBytes), 4)).resolves.toMatchObject({ valid: false, error: supportedImageError });
  });

  it('rejects oversized images', async () => {
    const oversized = new Uint8Array(4 * 1024 * 1024 + 1);
    oversized.set(jpegBytes, 0);
    oversized[oversized.length - 2] = 0xff;
    oversized[oversized.length - 1] = 0xd9;

    await expect(validateUploadImageFile(file('large.jpg', 'image/jpeg', oversized), 4)).resolves.toMatchObject({ valid: false, error: 'Image size must be 4MB or less.' });
  });
});

function file(name: string, type: string, content: Uint8Array) {
  return new File([content], name, { type });
}
