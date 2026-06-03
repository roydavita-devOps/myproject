import { Website } from '../../types/api';
import { http } from '../../lib/api/http';

export const publicSiteApi = {
  async bySlug(slug: string) {
    const { data } = await http.get<Website>(`/public/site/${slug}`);
    return data;
  },
  async byHost() {
    const { data } = await http.get<Website>('/public/site');
    return data;
  },
};
