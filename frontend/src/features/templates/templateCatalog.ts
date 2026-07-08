import { TemplateCatalogItem } from '../../types/api';
import { isTemplateKey, templateMetadata } from './registry/templateMetadata';
import { TemplateKey, TemplateMetadata } from './registry/templateTypes';

export type CatalogCard = {
  templateKey: TemplateKey;
  displayName: string;
  description: string;
  industry: string;
  category: string;
  previewImage: string;
  recommendedBusinessTypes: string[];
  metadata: TemplateMetadata;
};

export function buildCatalogCards(templates: TemplateCatalogItem[]): CatalogCard[] {
  const activeCards = templates
    .filter((template) => isTemplateKey(template.templateKey))
    .map((template) => ({
      ...template,
      templateKey: template.templateKey as TemplateKey,
      metadata: templateMetadata[template.templateKey as TemplateKey],
    }));
  const activeKeys = new Set(activeCards.map((template) => template.templateKey));
  const comingSoonCards = Object.values(templateMetadata)
    .filter((metadata) => metadata.catalogStatus === 'coming_soon' && !activeKeys.has(metadata.key))
    .map((metadata) => ({
      templateKey: metadata.key,
      displayName: metadata.displayName,
      description: metadata.description,
      industry: metadata.industry,
      category: metadata.category,
      previewImage: metadata.previewImage,
      recommendedBusinessTypes: metadata.recommendedBusinessTypes,
      metadata,
    }));

  return [...activeCards, ...comingSoonCards];
}

export function isRecommendedTemplate(template: Pick<CatalogCard, 'recommendedBusinessTypes'>, businessType?: string | null) {
  return Boolean(businessType && template.recommendedBusinessTypes.includes(businessType));
}

export function displayTierForTemplate(template: Pick<CatalogCard, 'metadata'>) {
  return template.metadata.tier === 'premium' && template.metadata.catalogStatus === 'locked' ? 'Premium' : 'Classic';
}

export function isSelectableTemplate(template: Pick<CatalogCard, 'metadata'>) {
  return template.metadata.status === 'active' && template.metadata.catalogStatus !== 'coming_soon';
}

export function sortTemplates(templates: CatalogCard[], businessType?: string | null) {
  return [...templates].sort((a, b) => {
    const aRecommended = isRecommendedTemplate(a, businessType) ? 0 : 1;
    const bRecommended = isRecommendedTemplate(b, businessType) ? 0 : 1;
    if (aRecommended !== bRecommended) return aRecommended - bRecommended;
    const aLocked = a.metadata.catalogStatus === 'locked' ? 0 : 1;
    const bLocked = b.metadata.catalogStatus === 'locked' ? 0 : 1;
    if (aLocked !== bLocked) return aLocked - bLocked;
    const aTier = displayTierForTemplate(a);
    const bTier = displayTierForTemplate(b);
    if (aTier !== bTier) return aTier === 'Premium' ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}
