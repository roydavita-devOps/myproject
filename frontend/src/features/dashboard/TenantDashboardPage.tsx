import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ExternalLink, Globe2, MenuSquare, MonitorSmartphone } from 'lucide-react';
import { websitesApi } from '../websites/websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/State';

export function TenantDashboardPage() {
  const { data: websites = [], isLoading } = useQuery({ queryKey: ['websites'], queryFn: websitesApi.list });
  const website = websites[0];

  if (isLoading) return <LoadingState label="Loading dashboard" />;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan operasional website bisnis.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <MonitorSmartphone className="size-5 text-teal-700" />
          <p className="mt-4 text-sm text-slate-500">Website</p>
          <p className="text-xl font-semibold">{website?.businessName ?? 'Belum ada website'}</p>
        </div>
        <div className="panel p-5">
          <Globe2 className="size-5 text-blue-700" />
          <p className="mt-4 text-sm text-slate-500">Status</p>
          <div className="mt-1">{website ? <Badge tone={website.status === 'PUBLISHED' ? 'green' : 'amber'}>{website.status}</Badge> : <Badge>EMPTY</Badge>}</div>
        </div>
        <div className="panel p-5">
          <MenuSquare className="size-5 text-amber-700" />
          <p className="mt-4 text-sm text-slate-500">Content</p>
          <p className="text-xl font-semibold">{website?.menus?.length ?? 0} items</p>
        </div>
      </div>
      <div className="panel p-5">
        <h2 className="font-semibold">Next actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to={website ? `/app/websites/${website.id}` : '/app/websites'}>
            <Button>
              <MonitorSmartphone className="size-4" />
              Edit website
            </Button>
          </Link>
          <Link to="/app/menu">
            <Button variant="secondary">
              <MenuSquare className="size-4" />
              Manage menu
            </Button>
          </Link>
          {website && (
            <Link to={`/app/websites/${website.id}/preview`}>
              <Button variant="ghost">
                <ExternalLink className="size-4" />
                Preview
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
