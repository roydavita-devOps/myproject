const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

export const supportedImageError = 'Only JPG, PNG, or WEBP images are supported.';

export type ImageValidationResult = {
  valid: boolean;
  error?: string;
};

export async function validateUploadImageFile(file: File, maxSizeMb: number): Promise<ImageValidationResult> {
  if (!hasAllowedExtension(file.name) || !allowedMimeTypes.includes(file.type) || !extensionMatchesMimeType(file.name, file.type)) {
    return { valid: false, error: supportedImageError };
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return { valid: false, error: `Image size must be ${maxSizeMb}MB or less.` };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(file.type, buffer)) {
    return { valid: false, error: supportedImageError };
  }

  return { valid: true };
}

function hasAllowedExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return Boolean(extension && allowedExtensions.includes(extension));
}

function extensionMatchesMimeType(fileName: string, mimeType: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (mimeType === 'image/jpeg') return extension === 'jpg' || extension === 'jpeg';
  if (mimeType === 'image/png') return extension === 'png';
  if (mimeType === 'image/webp') return extension === 'webp';
  return false;
}

function hasValidImageSignature(mimeType: string, buffer: Uint8Array) {
  if (mimeType === 'image/jpeg') {
    return buffer.length > 4
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff
      && buffer[buffer.length - 2] === 0xff
      && buffer[buffer.length - 1] === 0xd9;
  }

  if (mimeType === 'image/png') {
    return buffer.length > 24
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47
      && buffer[4] === 0x0d
      && buffer[5] === 0x0a
      && buffer[6] === 0x1a
      && buffer[7] === 0x0a
      && containsAscii(buffer, 'IEND');
  }

  if (mimeType === 'image/webp') {
    return buffer.length > 12
      && ascii(buffer, 0, 4) === 'RIFF'
      && ascii(buffer, 8, 12) === 'WEBP'
      && declaredWebpSize(buffer) <= buffer.length;
  }

  return false;
}

function ascii(buffer: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...buffer.slice(start, end));
}

function containsAscii(buffer: Uint8Array, value: string) {
  const needle = [...value].map((char) => char.charCodeAt(0));
  return buffer.some((_, index) => needle.every((byte, offset) => buffer[index + offset] === byte));
}

function declaredWebpSize(buffer: Uint8Array) {
  return buffer[4] + (buffer[5] << 8) + (buffer[6] << 16) + (buffer[7] << 24) + 8;
}
