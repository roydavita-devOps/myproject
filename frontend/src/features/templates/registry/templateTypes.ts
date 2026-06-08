import { ComponentType } from 'react';
import { Website } from '../../../types/api';

export type TemplateKey =
  | 'restaurant_classic'
  | 'restaurant_premium'
  | 'restaurant_luxury'
  | 'cafe_minimal'
  | 'cafe_modern'
  | 'cafe_premium'
  | 'clinic_professional'
  | 'corporate_executive'
  | 'minimal_business';

export type TemplateRendererKey = 'restaurant' | 'generic_business';

export type TemplateTier = 'standard' | 'premium' | 'luxury';

export type TemplateMetadata = {
  key: TemplateKey;
  displayName: string;
  rendererKey: TemplateRendererKey;
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
