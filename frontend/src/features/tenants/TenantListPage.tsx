import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, PauseCircle, Trash2 } from 'lucide-react';
import { tenantsApi } from './tenants.api';
import { Badge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/IconButton';
import { LoadingState } from '../../components/ui/State';

function tenantTone(status: string) {
  if (status === 'ACTIVE' || status === 'TRIAL') return 'green';
  if (status === 'SUSPENDED') return 'amber';
  if (status === 'DELETED') return 'red';
  return 'slate';
}

export function TenantListPage() {
  const queryClient = useQueryClient();
  const { data: tenants = [], isLoading } = useQuery({ queryKey: ['tenants'], queryFn: tenantsApi.list });
  const mutation = useMutation({
    mutationFn: ({ action, id }: { action: 'suspend' | 'activate' | 'remove'; id: string }) => {
      if (action === 'suspend') return tenantsApi.suspend(id);
      if (action === 'activate') return tenantsApi.activate(id);
      return tenantsApi.remove(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  if (isLoading) return <LoadingState label="Loading tenants" />;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Tenants</h1>
        <p className="mt-1 text-sm text-slate-500">Manage tenant lifecycle and operational status.</p>
      </div>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{tenant.name}</td>
                  <td className="px-4 py-3 text-slate-600">{tenant.slug}</td>
                  <td className="px-4 py-3"><Badge tone={tenantTone(tenant.status)}>{tenant.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{tenant.subscriptions?.[0]?.plan ?? 'FREE'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <IconButton label="Activate tenant" onClick={() => mutation.mutate({ action: 'activate', id: tenant.id })}>
                        <CheckCircle2 className="size-4" />
                      </IconButton>
                      <IconButton label="Suspend tenant" onClick={() => mutation.mutate({ action: 'suspend', id: tenant.id })}>
                        <PauseCircle className="size-4" />
                      </IconButton>
                      <IconButton label="Delete tenant" onClick={() => mutation.mutate({ action: 'remove', id: tenant.id })}>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
