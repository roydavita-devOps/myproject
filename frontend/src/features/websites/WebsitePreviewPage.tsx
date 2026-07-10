import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { websitesApi } from './websites.api';
import { PublicSiteRenderer } from '../public-site/PublicSitePage';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/State';
import { isTemplateKey, templateMetadata } from '../templates/registry/templateMetadata';
import { Website } from '../../types/api';
import { consolidatedFreeTemplateForKey } from '../templates/templateCatalog';

export function WebsitePreviewPage() {
  const { websiteId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { data: website, isLoading } = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
  });

  if (isLoading || !website) return <LoadingState label="Loading preview" />;
  const previewTemplateKey = searchParams.get('templateKey');
  const previewWebsite = templatePreviewWebsite(website, previewTemplateKey);
  const previewTemplateName = isTemplateKey(previewTemplateKey)
    ? consolidatedFreeTemplateForKey(previewTemplateKey)?.displayName ?? templateMetadata[previewTemplateKey].displayName
    : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Preview: {website.businessName}</p>
            {previewTemplateName && <p className="mt-1 text-xs text-slate-300">Viewing {previewTemplateName}. This preview does not change your selected template.</p>}
          </div>
          <Link to={`/app/websites/${website.id}/templates`}>
            <Button variant="secondary">
              <ArrowLeft className="size-4" />
              Templates
            </Button>
          </Link>
        </div>
      </div>
      <PublicSiteRenderer website={previewWebsite} />
    </div>
  );
}

function templatePreviewWebsite(website: Website, templateKey?: string | null): Website {
  if (!isTemplateKey(templateKey)) return website;
  const metadata = templateMetadata[templateKey];
  if (metadata.status !== 'active') return website;

  return {
    ...website,
    template: {
      id: website.template?.id ?? `preview-${templateKey}`,
      name: metadata.key,
      businessType: website.template?.businessType ?? metadata.recommendedBusinessTypes[0] ?? 'LOCAL_SERVICE',
      schema: {
        ...website.template?.schema,
        templateKey: metadata.key,
        rendererKey: metadata.rendererKey,
      },
    },
  };
}
