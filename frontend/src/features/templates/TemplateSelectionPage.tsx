import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, Layers3, Palette, Save, Sparkles } from 'lucide-react';
import { templatesApi } from './templates.api';
import { resolveTemplate } from './registry/templateResolver';
import { presetsForVariant, resolvePremiumColorTokens, resolvePremiumVariant } from './premiumTheme';
import { websitesApi } from '../websites/websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState, LoadingState } from '../../components/ui/State';
import { Website } from '../../types/api';
import { TemplateKey } from './registry/templateTypes';
import { buildCatalogCards, CatalogCard, displayTierForTemplate, isRecommendedTemplate, isSelectableTemplate, sortTemplates } from './templateCatalog';

export function TemplateSelectionPage() {
  const { websiteId = '' } = useParams();
  const queryClient = useQueryClient();
  const websiteQuery = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
  });
  const templatesQuery = useQuery({ queryKey: ['templates'], queryFn: templatesApi.list });
  const [pendingTemplate, setPendingTemplate] = useState<CatalogCard | null>(null);
  const applyMutation = useMutation({
    mutationFn: (templateKey: string) => websitesApi.assignTemplate(websiteId, { templateKey }),
    onSuccess: (updatedWebsite) => {
      queryClient.setQueryData(['websites', websiteId], updatedWebsite);
      queryClient.setQueryData(['websites'], (current: Website[] | undefined) =>
        current?.map((item) => (item.id === updatedWebsite.id ? updatedWebsite : item)),
      );
    },
  });
  const themeMutation = useMutation({
    mutationFn: (payload: { primaryColor: string; accentColor: string; premiumColorPreset: string }) => websitesApi.updateThemeAssets(websiteId, payload),
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
  const catalogCards = buildCatalogCards(templatesQuery.data ?? []);
  const sortedTemplates = sortTemplates(catalogCards, website.template?.businessType);
  const recommendedTemplates = sortedTemplates.filter((template) => isRecommendedTemplate(template, website.template?.businessType) && isSelectableTemplate(template));
  const premiumTemplates = sortedTemplates.filter((template) => displayTierForTemplate(template) === 'Premium' && isSelectableTemplate(template));
  const classicTemplates = sortedTemplates.filter((template) => displayTierForTemplate(template) === 'Classic' && isSelectableTemplate(template));
  const premiumVariant = resolvePremiumVariant(website);

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

      {premiumVariant && (
        <BrandColorSettings
          website={website}
          variant={premiumVariant}
          isSaving={themeMutation.isPending}
          onSave={(payload) => themeMutation.mutate(payload)}
        />
      )}

      <CatalogSection
        title="Recommended for your business"
        description="Business type helps us sort templates first. You can still choose any available template."
        templates={recommendedTemplates}
        website={website}
        currentTemplateKey={currentTemplateKey}
        isApplying={applyMutation.isPending}
        applyingTemplateKey={applyMutation.variables}
        onSelect={setPendingTemplate}
      />

      <CatalogSection
        title="Premium Templates"
        description="Locked and approved premium templates with richer layouts, premium hero behavior, and stronger visual sections."
        templates={premiumTemplates}
        website={website}
        currentTemplateKey={currentTemplateKey}
        isApplying={applyMutation.isPending}
        applyingTemplateKey={applyMutation.variables}
        onSelect={setPendingTemplate}
      />

      <CatalogSection
        title="Classic Templates"
        description="Available classic templates for straightforward business websites."
        templates={classicTemplates}
        website={website}
        currentTemplateKey={currentTemplateKey}
        isApplying={applyMutation.isPending}
        applyingTemplateKey={applyMutation.variables}
        onSelect={setPendingTemplate}
      />

      <CatalogSection
        title="All Templates"
        description="Browse every template. Premium payment controls will be added in a future release; selection is open during pilot."
        templates={sortedTemplates}
        website={website}
        currentTemplateKey={currentTemplateKey}
        isApplying={applyMutation.isPending}
        applyingTemplateKey={applyMutation.variables}
        onSelect={setPendingTemplate}
      />

      {pendingTemplate && (
        <TemplateChangeConfirmation
          template={pendingTemplate}
          isApplying={applyMutation.isPending}
          onCancel={() => setPendingTemplate(null)}
          onConfirm={() => {
            applyMutation.mutate(pendingTemplate.templateKey, {
              onSuccess: () => setPendingTemplate(null),
            });
          }}
        />
      )}
    </section>
  );
}

function CatalogSection({
  title,
  description,
  templates,
  website,
  currentTemplateKey,
  isApplying,
  applyingTemplateKey,
  onSelect,
}: {
  title: string;
  description: string;
  templates: CatalogCard[];
  website: Website;
  currentTemplateKey: TemplateKey;
  isApplying: boolean;
  applyingTemplateKey?: string;
  onSelect: (template: CatalogCard) => void;
}) {
  if (templates.length === 0) return null;

  return (
    <section className="grid gap-4" data-testid={`template-section-${slugify(title)}`}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={`${title}-${template.templateKey}`}
            template={template}
            website={website}
            isCurrent={template.templateKey === currentTemplateKey}
            isRecommended={isRecommendedTemplate(template, website.template?.businessType)}
            isApplying={isApplying && applyingTemplateKey === template.templateKey}
            isDisabled={isApplying}
            onSelect={() => onSelect(template)}
          />
        ))}
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  website,
  isCurrent,
  isRecommended,
  isApplying,
  isDisabled,
  onSelect,
}: {
  template: CatalogCard;
  website: Website;
  isCurrent: boolean;
  isRecommended: boolean;
  isApplying: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  const displayTier = displayTierForTemplate(template);
  const catalogStatus = template.metadata.catalogStatus ?? (template.metadata.status === 'planned' ? 'coming_soon' : 'available');
  const selectable = isSelectableTemplate(template);
  const highlights = template.metadata.previewHighlights ?? [];

  return (
    <article className={`panel flex min-h-[31rem] flex-col overflow-hidden ${displayTier === 'Premium' ? 'border-amber-200 shadow-[0_20px_60px_rgba(120,68,20,.10)]' : ''}`}>
      <img
        src={`/template-previews/${template.previewImage}`}
        alt={`${template.displayName} preview`}
        className="aspect-[16/10] w-full border-b border-slate-200 bg-slate-100 object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <div className="flex grow flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={displayTier === 'Premium' ? 'amber' : 'slate'}>{displayTier}</Badge>
          {catalogStatus === 'locked' && <Badge tone="green">Approved Premium</Badge>}
          {catalogStatus === 'coming_soon' && <Badge tone="slate">Coming soon</Badge>}
          {isRecommended && <Badge tone="green">Recommended</Badge>}
          {isCurrent && <Badge tone="green">Current template</Badge>}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{template.displayName}</h3>
          <p className="mt-1 text-sm text-slate-500">{template.category} · {template.industry}</p>
        </div>
        <p className="text-sm leading-6 text-slate-600">{template.description}</p>
        {highlights.length > 0 && (
          <ul className="grid gap-2 text-sm text-slate-600">
            {highlights.slice(0, 3).map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-teal-700" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-auto rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          {displayTier === 'Premium'
            ? 'Premium template available during pilot. Payment control will be added in a future release.'
            : 'Classic template for straightforward website publishing.'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {selectable ? (
            <Link to={`/app/websites/${website.id}/preview?templateKey=${template.templateKey}`}>
              <Button className="w-full" variant="secondary">
                <Eye className="size-4" />
                Preview
              </Button>
            </Link>
          ) : (
            <Button className="w-full" variant="secondary" disabled>
              <Eye className="size-4" />
              Preview
            </Button>
          )}
          <Button
            className="w-full"
            disabled={isCurrent || isDisabled || !selectable}
            variant={isCurrent ? 'secondary' : 'primary'}
            onClick={onSelect}
          >
            {isCurrent ? <CheckCircle2 className="size-4" /> : displayTier === 'Premium' ? <Sparkles className="size-4" /> : <Layers3 className="size-4" />}
            {isCurrent ? 'Current' : isApplying ? 'Applying' : selectable ? 'Use template' : 'Coming soon'}
          </Button>
        </div>
      </div>
    </article>
  );
}

function TemplateChangeConfirmation({
  template,
  isApplying,
  onCancel,
  onConfirm,
}: {
  template: CatalogCard;
  isApplying: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4" role="dialog" aria-modal="true" aria-labelledby="template-change-title">
      <section className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <Badge tone={displayTierForTemplate(template) === 'Premium' ? 'amber' : 'slate'}>{displayTierForTemplate(template)}</Badge>
        <h2 id="template-change-title" className="mt-4 text-xl font-semibold text-slate-950">Change template to {template.displayName}?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Changing template may change the layout of your public website, but your business data, menu, gallery, and contact information will remain.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isApplying}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isApplying}>
            <Layers3 className="size-4" />
            {isApplying ? 'Applying' : 'Confirm change'}
          </Button>
        </div>
      </section>
    </div>
  );
}

function BrandColorSettings({
  website,
  variant,
  isSaving,
  onSave,
}: {
  website: Website;
  variant: 'restaurant' | 'cafe';
  isSaving: boolean;
  onSave: (payload: { primaryColor: string; accentColor: string; premiumColorPreset: string }) => void;
}) {
  const presets = useMemo(() => presetsForVariant(variant), [variant]);
  const currentPreset = website.theme?.typography?.premiumColorPreset ?? presets[0]?.key ?? '';
  const currentTokens = resolvePremiumColorTokens(website);
  const [presetKey, setPresetKey] = useState(currentPreset);
  const [primaryColor, setPrimaryColor] = useState(website.theme?.primaryColor ?? currentTokens.primary);
  const [accentColor, setAccentColor] = useState(website.theme?.accentColor ?? currentTokens.accent);

  useEffect(() => {
    const preset = presets.find((item) => item.key === currentPreset) ?? presets[0];
    setPresetKey(currentPreset);
    setPrimaryColor(website.theme?.primaryColor ?? preset?.tokens.primary ?? currentTokens.primary);
    setAccentColor(website.theme?.accentColor ?? preset?.tokens.accent ?? currentTokens.accent);
  }, [currentPreset, currentTokens.accent, currentTokens.primary, presets, website.theme?.accentColor, website.theme?.primaryColor]);

  function applyPreset(nextPresetKey: string) {
    const preset = presets.find((item) => item.key === nextPresetKey);
    setPresetKey(nextPresetKey);
    if (!preset) return;
    setPrimaryColor(preset.tokens.primary);
    setAccentColor(preset.tokens.accent);
  }

  const previewStyle = {
    background: primaryColor,
    color: textColorFor(primaryColor),
    borderColor: accentColor,
  };

  return (
    <section className="panel grid gap-5 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <Palette className="size-4" />
            Brand Colors
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Premium color settings</h2>
          <p className="mt-1 text-sm text-slate-500">Pilih preset premium atau sesuaikan warna utama brand. Template tetap menjaga kontras dasar.</p>
        </div>
        <button type="button" className="rounded-md border border-slate-200 p-3 text-left shadow-sm" style={previewStyle}>
          <span className="block text-xs font-semibold uppercase opacity-80">Preview</span>
          <span className="mt-1 block text-sm font-semibold">Premium CTA</span>
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr_.8fr_auto] md:items-end">
        <label className="grid gap-2">
          <span className="field-label">Preset</span>
          <select className="field-input" value={presetKey} onChange={(event) => applyPreset(event.target.value)}>
            {presets.map((preset) => <option key={preset.key} value={preset.key}>{preset.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="field-label">Primary Color</span>
          <input className="field-input h-11" type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="field-label">Accent Color</span>
          <input className="field-input h-11" type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
        </label>
        <Button onClick={() => onSave({ primaryColor, accentColor, premiumColorPreset: presetKey })} disabled={isSaving}>
          <Save className="size-4" />
          {isSaving ? 'Saving' : 'Save colors'}
        </Button>
      </div>
    </section>
  );
}

function textColorFor(hex: string) {
  const normalized = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.slice(1) : '111827';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? '#111827' : '#ffffff';
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
