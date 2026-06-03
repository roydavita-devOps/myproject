import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Shield } from 'lucide-react';
import { tenantsApi } from '../tenants/tenants.api';
import { LoadingState } from '../../components/ui/State';

export function AdminDashboardPage() {
  const { data: tenants = [], isLoading } = useQuery({ queryKey: ['tenants'], queryFn: tenantsApi.list });
  if (isLoading) return <LoadingState label="Loading platform dashboard" />;

  const activeCount = tenants.filter((tenant) => tenant.status === 'ACTIVE' || tenant.status === 'TRIAL').length;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Platform Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Operational snapshot for the SaaS platform.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <Building2 className="size-5 text-teal-700" />
          <p className="mt-4 text-sm text-slate-500">Tenants</p>
          <p className="text-2xl font-semibold">{tenants.length}</p>
        </div>
        <div className="panel p-5">
          <Shield className="size-5 text-blue-700" />
          <p className="mt-4 text-sm text-slate-500">Active</p>
          <p className="text-2xl font-semibold">{activeCount}</p>
        </div>
        <div className="panel p-5">
          <CreditCard className="size-5 text-amber-700" />
          <p className="mt-4 text-sm text-slate-500">Plans</p>
          <p className="text-2xl font-semibold">{new Set(tenants.flatMap((tenant) => tenant.subscriptions?.map((subscription) => subscription.plan) ?? [])).size}</p>
        </div>
      </div>
    </section>
  );
}
