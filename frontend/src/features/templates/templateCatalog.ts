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

export type UserFacingTemplateTier = 'Free' | 'Premium';

export const primaryRecommendedTemplateKey: TemplateKey = 'restaurant_premium';

export function buildCatalogCards(templates: TemplateCatalogItem[]): CatalogCard[] {
  const cardsByKey = new Map<TemplateKey, CatalogCard>();

  templates
    .filter((template) => isTemplateKey(template.templateKey))
    .map((template) => {
      const metadata = templateMetadata[template.templateKey as TemplateKey];

      return {
        ...template,
        templateKey: template.templateKey as TemplateKey,
        displayName: metadata.displayName,
        description: metadata.description,
        metadata,
      };
    })
    .filter(isCatalogVisible)
    .forEach((template) => cardsByKey.set(template.templateKey, template));

  Object.values(templateMetadata)
    .filter((metadata) => isCatalogVisible({ metadata }))
    .forEach((metadata) => {
      if (cardsByKey.has(metadata.key)) return;

      cardsByKey.set(metadata.key, {
        templateKey: metadata.key,
        displayName: metadata.displayName,
        description: metadata.description,
        industry: metadata.industry,
        category: metadata.category,
        previewImage: metadata.previewImage,
        recommendedBusinessTypes: metadata.recommendedBusinessTypes,
        metadata,
      });
    });

  return [...cardsByKey.values()];
}

export function isRecommendedTemplate(template: Pick<CatalogCard, 'recommendedBusinessTypes'>, businessType?: string | null) {
  return Boolean(businessType && template.recommendedBusinessTypes.includes(businessType));
}

export function displayTierForTemplate(template: Pick<CatalogCard, 'metadata'>): UserFacingTemplateTier {
  return template.metadata.catalogStatus === 'locked' ? 'Premium' : 'Free';
}

export function isSelectableTemplate(template: Pick<CatalogCard, 'metadata'>) {
  return template.metadata.status === 'active' && isCatalogVisible(template);
}

export function isCatalogVisible(template: Pick<CatalogCard, 'metadata'>) {
  return template.metadata.status === 'active' && template.metadata.catalogVisibility !== 'hidden' && template.metadata.catalogStatus !== 'coming_soon';
}

export function isPrimaryRecommendedTemplate(template: Pick<CatalogCard, 'templateKey'>) {
  return template.templateKey === primaryRecommendedTemplateKey;
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
