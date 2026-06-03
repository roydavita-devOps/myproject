import { ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { CheckCircle2, ExternalLink, Globe2, ImageIcon, MenuSquare, MonitorSmartphone } from 'lucide-react';
import { websitesApi } from '../websites/websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/State';
import { Website } from '../../types/api';

type ChecklistItem = {
  label: string;
  done: boolean;
  href: string;
  cta: string;
};

export function TenantDashboardPage() {
  const { data: websites = [], isLoading } = useQuery({ queryKey: ['websites'], queryFn: websitesApi.list });
  const website = websites[0];
  const checklist = useMemo(() => buildChecklist(website), [website]);
  const completed = checklist.filter((item) => item.done).length;
  const readiness = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const remaining = checklist.length - completed;

  if (isLoading) return <LoadingState label="Loading dashboard" />;

  return (
    <section className="grid gap-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan kesiapan website bisnis.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<MonitorSmartphone className="size-5 text-teal-700" />} label="Website" value={website?.businessName ?? 'Belum ada website'} />
        <MetricCard
          icon={<Globe2 className="size-5 text-blue-700" />}
          label="Publish status"
          value={website ? <Badge tone={website.status === 'PUBLISHED' ? 'green' : 'amber'}>{website.status}</Badge> : <Badge>EMPTY</Badge>}
        />
        <MetricCard icon={<MenuSquare className="size-5 text-amber-700" />} label="Menu / services" value={`${website?.menus?.length ?? 0} items`} />
        <MetricCard icon={<ImageIcon className="size-5 text-fuchsia-700" />} label="Gallery" value={`${website?.galleries?.length ?? 0} images`} />
      </div>

      <section className="panel grid gap-5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Website readiness</h2>
            <p className="mt-1 text-sm text-slate-500">{remaining === 0 ? 'Website siap dipakai pilot user.' : `${remaining} tugas tersisa sebelum website siap dibagikan.`}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-semibold text-slate-950">{readiness}%</p>
            <p className="text-xs text-slate-500">completion</p>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${readiness}%` }} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <CheckCircle2 className={item.done ? 'size-5 shrink-0 text-teal-700' : 'size-5 shrink-0 text-slate-300'} />
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
              </div>
              {!item.done && (
                <Link to={item.href}>
                  <Button variant="secondary" className="whitespace-nowrap px-3">
                    {item.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="panel p-5">
        <h2 className="font-semibold">Next actions</h2>
        <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
          <Link to={website ? `/app/websites/${website.id}` : '/app/websites'}>
            <Button className="w-full sm:w-auto">
              <MonitorSmartphone className="size-4" />
              Edit website
            </Button>
          </Link>
          <Link to="/app/menu">
            <Button variant="secondary" className="w-full sm:w-auto">
              <MenuSquare className="size-4" />
              Manage menu
            </Button>
          </Link>
          {website && (
            <Link to={`/app/websites/${website.id}/preview`}>
              <Button variant="ghost" className="w-full sm:w-auto">
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

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="panel p-5">
      {icon}
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <div className="mt-1 text-xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function buildChecklist(website?: Website): ChecklistItem[] {
  const editorHref = website ? `/app/websites/${website.id}` : '/app/websites';
  return [
    {
      label: 'Business information completed',
      done: Boolean(website?.businessName && website.description && website.address),
      href: editorHref,
      cta: 'Edit',
    },
    {
      label: 'Logo uploaded',
      done: Boolean(website?.theme?.logoUrl),
      href: editorHref,
      cta: 'Upload',
    },
    {
      label: 'WhatsApp number added',
      done: Boolean(website?.whatsapp),
      href: editorHref,
      cta: 'Add',
    },
    {
      label: 'Menu / services added',
      done: Boolean(website?.menus?.length),
      href: '/app/menu',
      cta: 'Add menu',
    },
    {
      label: 'Website published',
      done: website?.status === 'PUBLISHED',
      href: editorHref,
      cta: 'Publish',
    },
  ];
}
