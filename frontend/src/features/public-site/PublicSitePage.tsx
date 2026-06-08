import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { publicSiteApi } from './publicSite.api';
import { Website } from '../../types/api';
import { ErrorState, LoadingState } from '../../components/ui/State';
import { resolveTemplateTheme } from '../templates/templateTheme';
import { resolveTemplate } from '../templates/registry/templateResolver';

export function PublicSitePage() {
  const { slug = '' } = useParams();
  const { data: website, isLoading, isError } = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => publicSiteApi.bySlug(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) return <LoadingState label="Loading public site" />;
  if (isError || !website) return <ErrorState message="Published site not found" />;

  return <PublicSiteRenderer website={website} />;
}

export function PublicSiteRenderer({ website }: { website: Website }) {
  const { renderer: TemplateRenderer, metadata } = resolveTemplate(website);

  return (
    <main
      className="tenant-body min-h-screen bg-[var(--tpl-surface)] text-[var(--tpl-text-primary)]"
      data-template-key={metadata.key}
      style={resolveTemplateTheme(website)}
    >
      <TemplateRenderer website={website} />
    </main>
  );
}
