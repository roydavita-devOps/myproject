import { Tenant } from '../../types/api';
import { http } from '../../lib/api/http';

export const tenantsApi = {
  async list() {
    const { data } = await http.get<Tenant[]>('/tenants');
    return data;
  },
  async suspend(id: string) {
    const { data } = await http.patch<Tenant>(`/tenants/${id}/suspend`);
    return data;
  },
  async activate(id: string) {
    const { data } = await http.patch<Tenant>(`/tenants/${id}/activate`);
    return data;
  },
  async remove(id: string) {
    const { data } = await http.delete<Tenant>(`/tenants/${id}`);
    return data;
  },
};
