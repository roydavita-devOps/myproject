import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCatalogCards,
  displayTierForTemplate,
  isPrimaryRecommendedTemplate,
  isRecommendedTemplate,
  isSelectableTemplate,
  sortTemplates,
} from '../../templateCatalog';
import { templateMetadata } from '../templateMetadata';
import { TemplateCatalogItem } from '../../../../types/api';

const apiTemplates: TemplateCatalogItem[] = [
  {
    templateKey: 'restaurant_classic',
    displayName: 'Restaurant Free',
    description: 'Simple food layout.',
    industry: 'Food & Beverage',
    category: 'Restaurant',
    tier: 'standard',
    previewImage: 'restaurant_classic.jpg',
    recommendedBusinessTypes: ['WARTEG', 'RESTAURANT'],
  },
  {
    templateKey: 'restaurant_premium',
    displayName: 'Restaurant Premium',
    description: 'Premium restaurant.',
    industry: 'Food & Beverage',
    category: 'Restaurant',
    tier: 'premium',
    previewImage: 'restaurant-premium.jpg',
    recommendedBusinessTypes: ['RESTAURANT', 'WARTEG', 'CAFE'],
  },
  {
    templateKey: 'cafe_modern',
    displayName: 'Cafe Free',
    description: 'Simple cafe layout.',
    industry: 'Food & Beverage',
    category: 'Cafe',
    tier: 'premium',
    previewImage: 'cafe-modern.jpg',
    recommendedBusinessTypes: ['CAFE'],
  },
  {
    templateKey: 'cafe_premium',
    displayName: 'Cafe Premium',
    description: 'Premium cafe.',
    industry: 'Food & Beverage',
    category: 'Cafe',
    tier: 'premium',
    previewImage: 'cafe-premium.jpg',
    recommendedBusinessTypes: ['CAFE'],
  },
];

describe('template catalog readiness', () => {
  it('uses only Free and Premium as user-facing tiers in the selection catalog', () => {
    const cards = buildCatalogCards(apiTemplates);
    const restaurantPremium = cards.find((template) => template.templateKey === 'restaurant_premium');
    const cafePremium = cards.find((template) => template.templateKey === 'cafe_premium');
    const restaurantClassic = cards.find((template) => template.templateKey === 'restaurant_classic');
    const cafeModern = cards.find((template) => template.templateKey === 'cafe_modern');

    expect(restaurantPremium?.metadata.catalogStatus).toBe('locked');
    expect(cafePremium?.metadata.catalogStatus).toBe('locked');
    expect(restaurantPremium && displayTierForTemplate(restaurantPremium)).toBe('Premium');
    expect(cafePremium && displayTierForTemplate(cafePremium)).toBe('Premium');
    expect(restaurantClassic && displayTierForTemplate(restaurantClassic)).toBe('Free');
    expect(cafeModern && displayTierForTemplate(cafeModern)).toBe('Free');
  });

  it('uses business type as recommendation signal without locking user choice', () => {
    const cards = sortTemplates(buildCatalogCards(apiTemplates), 'CAFE');
    const cafePremium = cards.find((template) => template.templateKey === 'cafe_premium');
    const restaurantPremium = cards.find((template) => template.templateKey === 'restaurant_premium');
    const restaurantClassic = cards.find((template) => template.templateKey === 'restaurant_classic');

    expect(cards[0].recommendedBusinessTypes).toContain('CAFE');
    expect(cafePremium && isRecommendedTemplate(cafePremium, 'CAFE')).toBe(true);
    expect(restaurantPremium && isRecommendedTemplate(restaurantPremium, 'CAFE')).toBe(true);
    expect(restaurantClassic && isRecommendedTemplate(restaurantClassic, 'CAFE')).toBe(false);
    expect(restaurantPremium && isSelectableTemplate(restaurantPremium)).toBe(true);
    expect(cafePremium && isSelectableTemplate(cafePremium)).toBe(true);
  });

  it('keeps Restaurant Premium as the only primary recommendation and hides luxury from the catalog', () => {
    const cards = buildCatalogCards(apiTemplates);
    const primaryCards = cards.filter(isPrimaryRecommendedTemplate);

    expect(primaryCards).toHaveLength(1);
    expect(primaryCards[0].templateKey).toBe('restaurant_premium');
    expect(cards.some((template) => template.templateKey === 'restaurant_luxury')).toBe(false);
    expect(templateMetadata.restaurant_luxury.catalogVisibility).toBe('hidden');
    expect(templateMetadata.restaurant_luxury.catalogStatus).toBe('coming_soon');
  });

  it('keeps internal template keys stable while simplifying Free display names', () => {
    expect(templateMetadata.restaurant_classic.displayName).toBe('Restaurant Free');
    expect(templateMetadata.laundry_clean.displayName).toBe('Laundry Free');
    expect(templateMetadata.cafe_modern.displayName).toBe('Cafe Free');
    expect(templateMetadata.clinic_professional.displayName).toBe('Clinic Free');
    expect(templateMetadata.corporate_executive.displayName).toBe('Corporate Free');
    expect(templateMetadata.minimal_business.displayName).toBe('Business Free');
    expect(templateMetadata.restaurant_premium.displayName).toBe('Restaurant Premium');
    expect(templateMetadata.cafe_premium.displayName).toBe('Cafe Premium');
    expect(templateMetadata.restaurant_classic.key).toBe('restaurant_classic');
    expect(templateMetadata.laundry_clean.key).toBe('laundry_clean');
    expect(templateMetadata.cafe_modern.key).toBe('cafe_modern');
    expect(templateMetadata.clinic_professional.key).toBe('clinic_professional');
    expect(templateMetadata.corporate_executive.key).toBe('corporate_executive');
    expect(templateMetadata.minimal_business.key).toBe('minimal_business');
  });

  it('keeps premium-only capabilities behind metadata flags', () => {
    expect(templateMetadata.restaurant_premium.capabilities?.heroSlideshow).toBe(true);
    expect(templateMetadata.cafe_premium.capabilities?.heroSlideshow).toBe(true);
    expect(templateMetadata.restaurant_classic.capabilities?.heroSlideshow).not.toBe(true);
    expect(templateMetadata.cafe_modern.capabilities?.heroSlideshow).not.toBe(true);
  });

  it('keeps payment and checkout actions out of the template catalog UI', () => {
    const source = readFileSync(resolve('src/features/templates/TemplateSelectionPage.tsx'), 'utf8');

    expect(source).toContain('Recommended Template');
    expect(source).toContain('Restaurant Premium is the primary premium reference');
    expect(source).toContain('View More Templates');
    expect(source).toContain('TemplateCatalogModal');
    expect(source).toContain('Free Templates');
    expect(source).toContain('Premium Templates');
    expect(source).toContain('Approved premium template available for selection.');
    expect(source).toContain('Free template for straightforward website publishing.');
    expect(source).not.toMatch(/restaurant_classic|laundry_clean|cafe_modern|clinic_professional|corporate_executive|minimal_business/);
    expect(source).not.toContain('Classic Templates');
    expect(source).not.toContain('Recommended for your business');
    expect(source).not.toContain('Payment control will be added in a future release.');
    expect(source).not.toMatch(/Pay now|Checkout|Subscribe to unlock|Purchase template/i);
  });
});
