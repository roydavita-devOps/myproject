import { ComponentType } from 'react';
import { Website } from '../../../types/api';

export type TemplateKey =
  | 'restaurant_classic'
  | 'restaurant_premium'
  | 'restaurant_luxury'
  | 'laundry_clean'
  | 'cafe_minimal'
  | 'cafe_modern'
  | 'cafe_premium'
  | 'clinic_professional'
  | 'corporate_executive'
  | 'minimal_business';

export type TemplateRendererKey =
  | 'restaurant'
  | 'restaurant_premium'
  | 'laundry'
  | 'clinic'
  | 'corporate'
  | 'cafe'
  | 'cafe_premium'
  | 'generic_business';

export type TemplateTier = 'standard' | 'premium' | 'luxury';

export type TemplateMetadata = {
  key: TemplateKey;
  displayName: string;
  description: string;
  industry: string;
  category: string;
  rendererKey: TemplateRendererKey;
  previewImage: string;
  tier: TemplateTier;
  recommendedBusinessTypes: string[];
  status: 'active' | 'planned';
};

export type TemplateRenderer = ComponentType<{ website: Website }>;

export type TemplateResolution = {
  metadata: TemplateMetadata;
  renderer: TemplateRenderer;
  source: 'schema-key' | 'schema-renderer' | 'template-name' | 'legacy-name' | 'fallback';
};
