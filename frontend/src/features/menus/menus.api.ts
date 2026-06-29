import { MenuCategory, MenuItem } from '../../types/api';
import { http } from '../../lib/api/http';

export type MenuPayload = {
  websiteId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type UpdateMenuPayload = Partial<MenuPayload>;

export const menusApi = {
  async listCategories(websiteId?: string) {
    const { data } = await http.get<MenuCategory[]>('/menu-categories', { params: { websiteId } });
    return data;
  },
  async createCategory(payload: { websiteId: string; name: string; sortOrder?: number }) {
    const { data } = await http.post<MenuCategory>('/menu-categories', payload);
    return data;
  },
  async deleteCategory(id: string) {
    const { data } = await http.delete<MenuCategory>(`/menu-categories/${id}`);
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
  async updateMenu(id: string, payload: UpdateMenuPayload) {
    const { data } = await http.put<MenuItem>(`/menus/${id}`, payload);
    return data;
  },
  async deleteMenu(id: string) {
    const { data } = await http.delete<MenuItem>(`/menus/${id}`);
    return data;
  },
};
