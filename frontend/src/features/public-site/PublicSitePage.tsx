import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { publicSiteApi } from './publicSite.api';
import { Website } from '../../types/api';
import { ErrorState, LoadingState } from '../../components/ui/State';
import { resolveTemplateTheme } from '../templates/templateTheme';
import {
  TemplateCTASection,
  TemplateFeatureSection,
  TemplateFooter,
  TemplateGallery,
  TemplateHero,
  TemplateLocationSection,
  TemplateNavigation,
  TemplatePricingBlock,
  TemplateServiceList,
  TemplateTestimonials,
  TemplateContactSection,
} from '../templates/TemplateComponents';
import { RestaurantTemplate } from '../templates/RestaurantTemplate';

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
  const businessType = website.template?.businessType;

  return (
    <main className="tenant-body min-h-screen bg-[var(--tpl-surface)] text-[var(--tpl-text-primary)]" style={resolveTemplateTheme(website)}>
      {businessType === 'RESTAURANT' || businessType === 'WARTEG' ? (
        <RestaurantTemplate website={website} />
      ) : (
        <>
          <TemplateNavigation website={website} />
          <TemplateHero website={website} />
          <TemplateFeatureSection website={website} />
          <TemplateServiceList items={website.menus ?? []} />
          <TemplatePricingBlock items={website.menus ?? []} />
          <TemplateGallery items={website.galleries ?? []} businessName={website.businessName} />
          <TemplateTestimonials reviews={website.reviews ?? []} />
          <TemplateLocationSection website={website} />
          <TemplateCTASection website={website} />
          <TemplateContactSection website={website} />
          <TemplateFooter website={website} />
        </>
      )}
    </main>
  );
}
