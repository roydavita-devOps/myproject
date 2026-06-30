import { AxiosProgressEvent } from 'axios';
import { http } from '../../lib/api/http';

export type UploadAssetType = 'logo' | 'hero' | 'menu' | 'gallery';

export type UploadedAsset = {
  tenantId: string;
  assetType: UploadAssetType;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  width: number;
  height: number;
  scan: {
    status: 'skipped' | 'passed';
    provider: string;
  };
};

export const uploadsApi = {
  async upload(assetType: UploadAssetType, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await http.post<UploadedAsset>(`/uploads/${assetType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!event.total) return;
        onProgress?.(Math.round((event.loaded * 100) / event.total));
      },
    });
    return data;
  },
};
