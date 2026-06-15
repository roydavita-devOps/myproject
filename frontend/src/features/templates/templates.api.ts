import { TemplateCatalogItem } from '../../types/api';
import { http } from '../../lib/api/http';

export const templatesApi = {
  async list() {
    const { data } = await http.get<TemplateCatalogItem[]>('/templates');
    return data;
  },
};
