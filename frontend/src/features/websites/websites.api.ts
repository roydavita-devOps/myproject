import { Website } from '../../types/api';
import { http } from '../../lib/api/http';

export type UpdateWebsitePayload = Partial<
  Pick<Website, 'businessName' | 'tagline' | 'description' | 'address' | 'phone' | 'whatsapp' | 'email' | 'mapsUrl' | 'openingHours'>
>;

export type UpdateThemeAssetsPayload = {
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  premiumColorPreset?: string;
};

export type ThemeAssetType = 'logo' | 'hero';

export type AddGalleryItemPayload = {
  imageUrl: string;
  category?: string;
  altText?: string;
};

export type AssignTemplatePayload = {
  templateKey: string;
};

export const websitesApi = {
  async list() {
    const { data } = await http.get<Website[]>('/websites');
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<Website>(`/websites/${id}`);
    return data;
  },
  async update(id: string, payload: UpdateWebsitePayload) {
    const { data } = await http.put<Website>(`/websites/${id}`, payload);
    return data;
  },
  async assignTemplate(id: string, payload: AssignTemplatePayload) {
    const { data } = await http.patch<Website>(`/websites/${id}/template`, payload);
    return data;
  },
  async updateThemeAssets(id: string, payload: UpdateThemeAssetsPayload) {
    const { data } = await http.patch<Website>(`/websites/${id}/theme-assets`, payload);
    return data;
  },
  async deleteThemeAsset(id: string, assetType: ThemeAssetType) {
    const { data } = await http.delete<Website>(`/websites/${id}/theme-assets/${assetType}`);
    return data;
  },
  async addGalleryItem(id: string, payload: AddGalleryItemPayload) {
    const { data } = await http.post<Website>(`/websites/${id}/gallery`, payload);
    return data;
  },
  async deleteGalleryItem(id: string, galleryId: string) {
    const { data } = await http.delete<Website>(`/websites/${id}/gallery/${galleryId}`);
    return data;
  },
  async publish(id: string) {
    const { data } = await http.patch<Website>(`/websites/${id}/publish`);
    return data;
  },
  async unpublish(id: string) {
    const { data } = await http.patch<Website>(`/websites/${id}/unpublish`);
    return data;
  },
};
