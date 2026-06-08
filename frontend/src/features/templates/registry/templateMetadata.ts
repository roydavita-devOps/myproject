import { TemplateKey, TemplateMetadata } from './templateTypes';

export const defaultTemplateKey: TemplateKey = 'minimal_business';

export const templateMetadata: Record<TemplateKey, TemplateMetadata> = {
  restaurant_classic: {
    key: 'restaurant_classic',
    displayName: 'Restaurant Classic',
    rendererKey: 'restaurant',
    tier: 'standard',
    recommendedBusinessTypes: ['WARTEG', 'RESTAURANT'],
    status: 'active',
  },
  restaurant_premium: {
    key: 'restaurant_premium',
    displayName: 'Restaurant Premium',
    rendererKey: 'restaurant',
    tier: 'premium',
    recommendedBusinessTypes: ['RESTAURANT', 'CAFE'],
    status: 'planned',
  },
  restaurant_luxury: {
    key: 'restaurant_luxury',
    displayName: 'Restaurant Luxury',
    rendererKey: 'restaurant',
    tier: 'luxury',
    recommendedBusinessTypes: ['RESTAURANT', 'CAFE'],
    status: 'planned',
  },
  cafe_minimal: {
    key: 'cafe_minimal',
    displayName: 'Cafe Minimal',
    rendererKey: 'generic_business',
    tier: 'standard',
    recommendedBusinessTypes: ['CAFE'],
    status: 'planned',
  },
  cafe_modern: {
    key: 'cafe_modern',
    displayName: 'Cafe Modern',
    rendererKey: 'generic_business',
    tier: 'premium',
    recommendedBusinessTypes: ['CAFE'],
    status: 'planned',
  },
  cafe_premium: {
    key: 'cafe_premium',
    displayName: 'Cafe Premium',
    rendererKey: 'generic_business',
    tier: 'premium',
    recommendedBusinessTypes: ['CAFE'],
    status: 'planned',
  },
  clinic_professional: {
    key: 'clinic_professional',
    displayName: 'Clinic Professional',
    rendererKey: 'generic_business',
    tier: 'standard',
    recommendedBusinessTypes: ['CLINIC'],
    status: 'planned',
  },
  corporate_executive: {
    key: 'corporate_executive',
    displayName: 'Corporate Executive',
    rendererKey: 'generic_business',
    tier: 'premium',
    recommendedBusinessTypes: ['CLINIC', 'LOCAL_SERVICE', 'RETAIL'],
    status: 'planned',
  },
  minimal_business: {
    key: 'minimal_business',
    displayName: 'Minimal Business',
    rendererKey: 'generic_business',
    tier: 'standard',
    recommendedBusinessTypes: ['LAUNDRY', 'WORKSHOP', 'SALON', 'RETAIL', 'LOCAL_SERVICE'],
    status: 'active',
  },
};

export const legacyTemplateNameAliases: Record<string, TemplateKey> = {
  restaurant_default: 'restaurant_classic',
  restaurant_demo_template: 'restaurant_classic',
  warteg_default: 'restaurant_classic',
  warteg_demo_template: 'restaurant_classic',
  laundry_default: 'minimal_business',
  laundry_demo_template: 'minimal_business',
  workshop_default: 'minimal_business',
  workshop_demo_template: 'minimal_business',
  clinic_default: 'minimal_business',
  clinic_demo_template: 'minimal_business',
  cafe_default: 'minimal_business',
  cafe_demo_template: 'minimal_business',
  salon_default: 'minimal_business',
  retail_default: 'minimal_business',
  local_service_default: 'minimal_business',
};

export function isTemplateKey(value?: string | null): value is TemplateKey {
  return Boolean(value && value in templateMetadata);
}
