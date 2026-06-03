import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Edit3, Eye, Globe2 } from 'lucide-react';
import { websitesApi } from './websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, LoadingState } from '../../components/ui/State';

export function WebsiteListPage() {
  const { data: websites = [], isLoading } = useQuery({ queryKey: ['websites'], queryFn: websitesApi.list });
  if (isLoading) return <LoadingState label="Loading websites" />;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Website</h1>
        <p className="mt-1 text-sm text-slate-500">Manage business profile, publishing, and preview.</p>
      </div>
      {websites.length === 0 ? (
        <EmptyState title="No website yet" description="Register flow normally creates the first draft website automatically." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {websites.map((website) => (
            <article key={website.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">{website.businessName}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{website.tagline ?? website.description ?? 'Business website draft'}</p>
                </div>
                <Badge tone={website.status === 'PUBLISHED' ? 'green' : 'amber'}>{website.status}</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/app/websites/${website.id}`}>
                  <Button>
                    <Edit3 className="size-4" />
                    Edit
                  </Button>
                </Link>
                <Link to={`/app/websites/${website.id}/preview`}>
                  <Button variant="secondary">
                    <Eye className="size-4" />
                    Preview
                  </Button>
                </Link>
                <Button variant="ghost">
                  <Globe2 className="size-4" />
                  Domain
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
