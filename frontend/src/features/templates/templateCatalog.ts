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
  relatedTemplateKeys?: TemplateKey[];
  previewHighlights?: string[];
  catalogSubtitle?: string;
};

export type UserFacingTemplateTier = 'Free' | 'Premium';
export type FreeTemplateGroupKey = 'food_beverage_free' | 'business_free' | 'services_free';

export const primaryRecommendedTemplateKey: TemplateKey = 'restaurant_premium';

export type FreeTemplateGroup = {
  groupKey: FreeTemplateGroupKey;
  displayName: string;
  description: string;
  category: string;
  industry: string;
  catalogSubtitle: string;
  previewImage: string;
  primaryTemplateKey: TemplateKey;
  relatedTemplateKeys: TemplateKey[];
  recommendedBusinessTypes: string[];
  previewHighlights: string[];
};

export const freeTemplateGroups: FreeTemplateGroup[] = [
  {
    groupKey: 'food_beverage_free',
    displayName: 'Food & Beverage Free',
    description: 'A simple starter layout for food and drink businesses such as restaurants, cafes, warteg, bakeries, and small eateries.',
    category: 'Food & Beverage',
    industry: 'Starter Template',
    catalogSubtitle: 'Food and drink starter',
    previewImage: 'food-beverage-free.svg',
    primaryTemplateKey: 'restaurant_classic',
    relatedTemplateKeys: ['restaurant_classic', 'cafe_modern'],
    recommendedBusinessTypes: ['WARTEG', 'RESTAURANT', 'CAFE'],
    previewHighlights: ['Menu-friendly structure', 'Contact and directions CTA', 'Simple food business sections'],
  },
  {
    groupKey: 'business_free',
    displayName: 'Business Free',
    description: 'A flexible starter layout for company profiles, service businesses, and general UMKM websites.',
    category: 'Business',
    industry: 'Starter Template',
    catalogSubtitle: 'Company and UMKM starter',
    previewImage: 'business-free.svg',
    primaryTemplateKey: 'corporate_executive',
    relatedTemplateKeys: ['corporate_executive', 'minimal_business'],
    recommendedBusinessTypes: ['RETAIL', 'LOCAL_SERVICE', 'WORKSHOP'],
    previewHighlights: ['Business profile sections', 'Services and credibility blocks', 'Contact-focused layout'],
  },
  {
    groupKey: 'services_free',
    displayName: 'Services Free',
    description: 'A simple service-business layout for local services such as laundry, clinic, salon, repair, and appointment-based businesses.',
    category: 'Services',
    industry: 'Starter Template',
    catalogSubtitle: 'Local service starter',
    previewImage: 'services-free.svg',
    primaryTemplateKey: 'laundry_clean',
    relatedTemplateKeys: ['laundry_clean', 'clinic_professional'],
    recommendedBusinessTypes: ['LAUNDRY', 'CLINIC', 'SALON', 'LOCAL_SERVICE'],
    previewHighlights: ['Service information structure', 'Contact and location CTA', 'Simple trust-building sections'],
  },
];

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

  const premiumCards = [...cardsByKey.values()].filter((template) => displayTierForTemplate(template) === 'Premium');
  return [...buildFreeGroupCards(), ...premiumCards];
}

function buildFreeGroupCards(): CatalogCard[] {
  return freeTemplateGroups.map((group) => {
    const metadata = templateMetadata[group.primaryTemplateKey];

    return {
      templateKey: group.primaryTemplateKey,
      displayName: group.displayName,
      description: group.description,
      industry: group.industry,
      category: group.category,
      previewImage: group.previewImage,
      recommendedBusinessTypes: group.recommendedBusinessTypes,
      metadata,
      relatedTemplateKeys: group.relatedTemplateKeys,
      previewHighlights: group.previewHighlights,
      catalogSubtitle: group.catalogSubtitle,
    };
  });
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

export function isTemplateCardSelected(template: Pick<CatalogCard, 'templateKey' | 'relatedTemplateKeys'>, currentTemplateKey: TemplateKey) {
  return template.templateKey === currentTemplateKey || Boolean(template.relatedTemplateKeys?.includes(currentTemplateKey));
}

export function consolidatedFreeTemplateForKey(templateKey: TemplateKey) {
  return freeTemplateGroups.find((group) => group.relatedTemplateKeys.includes(templateKey));
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
