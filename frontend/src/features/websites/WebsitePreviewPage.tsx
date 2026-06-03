import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { websitesApi } from './websites.api';
import { PublicSiteRenderer } from '../public-site/PublicSitePage';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/State';

export function WebsitePreviewPage() {
  const { websiteId = '' } = useParams();
  const { data: website, isLoading } = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
  });

  if (isLoading || !website) return <LoadingState label="Loading preview" />;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-sm font-medium">Preview: {website.businessName}</p>
          <Link to={`/app/websites/${website.id}`}>
            <Button variant="secondary">
              <ArrowLeft className="size-4" />
              Editor
            </Button>
          </Link>
        </div>
      </div>
      <PublicSiteRenderer website={website} />
    </div>
  );
}
