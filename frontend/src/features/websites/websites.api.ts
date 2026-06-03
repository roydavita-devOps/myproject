import { Website } from '../../types/api';
import { http } from '../../lib/api/http';

export type UpdateWebsitePayload = Partial<
  Pick<Website, 'businessName' | 'tagline' | 'description' | 'address' | 'phone' | 'whatsapp' | 'email' | 'mapsUrl'>
>;

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
  async publish(id: string) {
    const { data } = await http.patch<Website>(`/websites/${id}/publish`);
    return data;
  },
  async unpublish(id: string) {
    const { data } = await http.patch<Website>(`/websites/${id}/unpublish`);
    return data;
  },
};
