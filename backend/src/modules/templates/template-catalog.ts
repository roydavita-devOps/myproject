import { BusinessType } from '@prisma/client';

export type TemplateCatalogKey =
  | 'restaurant_classic'
  | 'restaurant_premium'
  | 'laundry_clean'
  | 'clinic_professional'
  | 'corporate_executive'
  | 'cafe_modern'
  | 'cafe_premium';

export type TemplateCatalogItem = {
  templateKey: TemplateCatalogKey;
  displayName: string;
  description: string;
  industry: string;
  category: string;
  rendererKey: string;
  tier: 'standard' | 'premium';
  previewImage: string;
  recommendedBusinessTypes: BusinessType[];
  status: 'active';
};

export const templateCatalog: TemplateCatalogItem[] = [
  {
    templateKey: 'restaurant_classic',
    displayName: 'Restaurant Classic',
    description: 'Clean restaurant landing page optimized for food businesses.',
    industry: 'Food & Beverage',
    category: 'Restaurant',
    rendererKey: 'restaurant',
    previewImage: 'restaurant_classic.jpg',
    tier: 'standard',
    recommendedBusinessTypes: [BusinessType.WARTEG, BusinessType.RESTAURANT],
    status: 'active',
  },
  {
    templateKey: 'restaurant_premium',
    displayName: 'Restaurant Premium',
    description: 'Premium restaurant landing page with chef story, signature dishes, and reservation-focused conversion.',
    industry: 'Food & Beverage',
    category: 'Restaurant',
    rendererKey: 'restaurant_premium',
    previewImage: 'restaurant-premium.jpg',
    tier: 'premium',
    recommendedBusinessTypes: [BusinessType.RESTAURANT, BusinessType.WARTEG, BusinessType.CAFE],
    status: 'active',
  },
  {
    templateKey: 'laundry_clean',
    displayName: 'Laundry Clean',
    description: 'Clean service landing page designed for laundry pickup, pricing, and contact flows.',
    industry: 'Local Services',
    category: 'Laundry',
    rendererKey: 'laundry',
    previewImage: 'laundry_clean.jpg',
    tier: 'standard',
    recommendedBusinessTypes: [BusinessType.LAUNDRY],
    status: 'active',
  },
  {
    templateKey: 'clinic_professional',
    displayName: 'Clinic Professional',
    description: 'Professional healthcare landing page designed for clinics and medical practices.',
    industry: 'Healthcare',
    category: 'Clinic',
    rendererKey: 'clinic',
    previewImage: 'clinic-professional.jpg',
    tier: 'standard',
    recommendedBusinessTypes: [BusinessType.CLINIC],
    status: 'active',
  },
  {
    templateKey: 'corporate_executive',
    displayName: 'Corporate Executive',
    description: 'Executive business template for corporate, professional service, and consulting websites.',
    industry: 'Business Services',
    category: 'Corporate',
    rendererKey: 'corporate',
    previewImage: 'corporate-executive.jpg',
    tier: 'premium',
    recommendedBusinessTypes: [BusinessType.CLINIC, BusinessType.LOCAL_SERVICE, BusinessType.RETAIL],
    status: 'active',
  },
  {
    templateKey: 'cafe_modern',
    displayName: 'Cafe Modern',
    description: 'Modern cafe template for lifestyle-focused cafes and coffee shops.',
    industry: 'Food & Beverage',
    category: 'Cafe',
    rendererKey: 'cafe',
    previewImage: 'cafe-modern.jpg',
    tier: 'premium',
    recommendedBusinessTypes: [BusinessType.CAFE],
    status: 'active',
  },
  {
    templateKey: 'cafe_premium',
    displayName: 'Cafe Premium',
    description: 'Premium cafe template with brand story, signature menu, visit planning, and contact-focused conversion.',
    industry: 'Food & Beverage',
    category: 'Cafe',
    rendererKey: 'cafe_premium',
    previewImage: 'cafe-premium.jpg',
    tier: 'premium',
    recommendedBusinessTypes: [BusinessType.CAFE],
    status: 'active',
  },
];
