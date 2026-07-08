import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCatalogCards,
  displayTierForTemplate,
  isRecommendedTemplate,
  isSelectableTemplate,
  sortTemplates,
} from '../../templateCatalog';
import { templateMetadata } from '../templateMetadata';
import { TemplateCatalogItem } from '../../../../types/api';

const apiTemplates: TemplateCatalogItem[] = [
  {
    templateKey: 'restaurant_classic',
    displayName: 'Restaurant Classic',
    description: 'Classic restaurant.',
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
    displayName: 'Cafe Modern',
    description: 'Modern cafe.',
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
  it('marks only locked premium templates as Premium in the selection catalog', () => {
    const cards = buildCatalogCards(apiTemplates);
    const restaurantPremium = cards.find((template) => template.templateKey === 'restaurant_premium');
    const cafePremium = cards.find((template) => template.templateKey === 'cafe_premium');
    const restaurantClassic = cards.find((template) => template.templateKey === 'restaurant_classic');
    const cafeModern = cards.find((template) => template.templateKey === 'cafe_modern');

    expect(restaurantPremium?.metadata.catalogStatus).toBe('locked');
    expect(cafePremium?.metadata.catalogStatus).toBe('locked');
    expect(restaurantPremium && displayTierForTemplate(restaurantPremium)).toBe('Premium');
    expect(cafePremium && displayTierForTemplate(cafePremium)).toBe('Premium');
    expect(restaurantClassic && displayTierForTemplate(restaurantClassic)).toBe('Classic');
    expect(cafeModern && displayTierForTemplate(cafeModern)).toBe('Classic');
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

  it('keeps premium-only capabilities behind metadata flags', () => {
    expect(templateMetadata.restaurant_premium.capabilities?.heroSlideshow).toBe(true);
    expect(templateMetadata.cafe_premium.capabilities?.heroSlideshow).toBe(true);
    expect(templateMetadata.restaurant_classic.capabilities?.heroSlideshow).not.toBe(true);
    expect(templateMetadata.cafe_modern.capabilities?.heroSlideshow).not.toBe(true);
  });

  it('keeps payment and checkout actions out of the template catalog UI', () => {
    const source = readFileSync(resolve('src/features/templates/TemplateSelectionPage.tsx'), 'utf8');

    expect(source).toContain('Premium Templates');
    expect(source).toContain('Classic Templates');
    expect(source).toContain('Recommended for your business');
    expect(source).toContain('Payment control will be added in a future release.');
    expect(source).not.toMatch(/Pay now|Checkout|Subscribe to unlock|Purchase template/i);
  });
});
