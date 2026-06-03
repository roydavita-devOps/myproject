import { MenuCategory, MenuItem } from '../../types/api';
import { http } from '../../lib/api/http';

export type MenuPayload = {
  websiteId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sortOrder?: number;
};

export const menusApi = {
  async listCategories(websiteId?: string) {
    const { data } = await http.get<MenuCategory[]>('/menu-categories', { params: { websiteId } });
    return data;
  },
  async createCategory(payload: { websiteId: string; name: string; sortOrder?: number }) {
    const { data } = await http.post<MenuCategory>('/menu-categories', payload);
    return data;
  },
  async listMenus(websiteId?: string) {
    const { data } = await http.get<MenuItem[]>('/menus', { params: { websiteId } });
    return data;
  },
  async createMenu(payload: MenuPayload) {
    const { data } = await http.post<MenuItem>('/menus', payload);
    return data;
  },
  async deleteMenu(id: string) {
    const { data } = await http.delete<MenuItem>(`/menus/${id}`);
    return data;
  },
};
