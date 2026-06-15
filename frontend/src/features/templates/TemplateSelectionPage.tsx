import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Layers3, Sparkles } from 'lucide-react';
import { templatesApi } from './templates.api';
import { resolveTemplate } from './registry/templateResolver';
import { websitesApi } from '../websites/websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState, LoadingState } from '../../components/ui/State';
import { TemplateCatalogItem, Website } from '../../types/api';

export function TemplateSelectionPage() {
  const { websiteId = '' } = useParams();
  const queryClient = useQueryClient();
  const websiteQuery = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
  });
  const templatesQuery = useQuery({ queryKey: ['templates'], queryFn: templatesApi.list });
  const applyMutation = useMutation({
    mutationFn: (templateKey: string) => websitesApi.assignTemplate(websiteId, { templateKey }),
    onSuccess: (updatedWebsite) => {
      queryClient.setQueryData(['websites', websiteId], updatedWebsite);
      queryClient.setQueryData(['websites'], (current: Website[] | undefined) =>
        current?.map((item) => (item.id === updatedWebsite.id ? updatedWebsite : item)),
      );
    },
  });

  if (websiteQuery.isLoading || templatesQuery.isLoading) return <LoadingState label="Loading templates" />;
  if (!websiteQuery.data || templatesQuery.isError) return <ErrorState message="Templates could not be loaded" />;

  const website = websiteQuery.data;
  const currentTemplateKey = resolveTemplate(website).metadata.key;
  const sortedTemplates = sortTemplates(templatesQuery.data ?? [], website.template?.businessType);

  return (
    <section className="grid gap-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Website Design</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Templates</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Pilih template aktif untuk {website.businessName}. Business type hanya rekomendasi; template tetap bisa dipilih lintas kategori.
          </p>
        </div>
        <Link to={`/app/websites/${website.id}`}>
          <Button variant="secondary">
            <ArrowLeft className="size-4" />
            Editor
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedTemplates.map((template) => {
          const isCurrent = template.templateKey === currentTemplateKey;
          const isRecommended = Boolean(website.template?.businessType && template.recommendedBusinessTypes.includes(website.template.businessType));
          const isApplying = applyMutation.isPending && applyMutation.variables === template.templateKey;

          return (
            <article key={template.templateKey} className="panel flex min-h-[26rem] flex-col overflow-hidden">
              <img
                src={`/template-previews/${template.previewImage}`}
                alt={`${template.displayName} preview`}
                className="aspect-[16/10] w-full border-b border-slate-200 bg-slate-100 object-cover"
              />
              <div className="flex grow flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={template.tier === 'premium' ? 'amber' : 'slate'}>{template.tier.toUpperCase()}</Badge>
                  {isRecommended && <Badge tone="green">RECOMMENDED</Badge>}
                  {isCurrent && <Badge tone="green">CURRENT TEMPLATE</Badge>}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{template.displayName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{template.category} · {template.industry}</p>
                </div>
                <p className="grow text-sm leading-6 text-slate-600">{template.description}</p>
                <Button
                  className="w-full"
                  disabled={isCurrent || applyMutation.isPending}
                  variant={isCurrent ? 'secondary' : 'primary'}
                  onClick={() => applyMutation.mutate(template.templateKey)}
                >
                  {isCurrent ? <CheckCircle2 className="size-4" /> : template.tier === 'premium' ? <Sparkles className="size-4" /> : <Layers3 className="size-4" />}
                  {isCurrent ? 'Current Template' : isApplying ? 'Applying' : 'Apply Template'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function sortTemplates(templates: TemplateCatalogItem[], businessType?: string) {
  return [...templates].sort((a, b) => {
    const aRecommended = businessType && a.recommendedBusinessTypes.includes(businessType) ? 0 : 1;
    const bRecommended = businessType && b.recommendedBusinessTypes.includes(businessType) ? 0 : 1;
    if (aRecommended !== bRecommended) return aRecommended - bRecommended;
    if (a.tier !== b.tier) return a.tier === 'standard' ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}
