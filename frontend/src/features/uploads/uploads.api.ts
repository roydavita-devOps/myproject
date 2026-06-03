import { AxiosProgressEvent } from 'axios';
import { http } from '../../lib/api/http';

export type UploadAssetType = 'logo' | 'hero' | 'gallery';

export type UploadedAsset = {
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
