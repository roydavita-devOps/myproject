export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type UploadAssetType = 'logo' | 'hero' | 'menu' | 'gallery';

export type StoredUpload = {
  tenantId: string;
  assetType: UploadAssetType;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  scan: {
    status: 'skipped' | 'passed';
    provider: string;
  };
};

export const UPLOAD_POLICIES: Record<UploadAssetType, { maxSize: number; directory: string }> = {
  logo: { maxSize: 1 * 1024 * 1024, directory: 'logos' },
  hero: { maxSize: 5 * 1024 * 1024, directory: 'heroes' },
  menu: { maxSize: 4 * 1024 * 1024, directory: 'menus' },
  gallery: { maxSize: 4 * 1024 * 1024, directory: 'galleries' },
};

export function isUploadAssetType(value: string): value is UploadAssetType {
  return Object.prototype.hasOwnProperty.call(UPLOAD_POLICIES, value);
}

export function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}
