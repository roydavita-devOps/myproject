import { describe, expect, it } from 'vitest';
import { Website } from '../../../types/api';
import { evaluatePublishReadiness } from '../publishReadiness';

describe('evaluatePublishReadiness', () => {
  it('blocks publish when required business data is incomplete', () => {
    const readiness = evaluatePublishReadiness(makeWebsite({
      businessName: '',
      address: '',
      whatsapp: '',
      phone: '',
      email: '',
      openingHours: null,
      tenant: { slug: 'Invalid Slug' },
    }));

    expect(readiness.readyToPublish).toBe(false);
    expect(readiness.required.filter((item) => item.status === 'missing').map((item) => item.key)).toEqual(
      expect.arrayContaining(['business-name', 'slug-valid', 'contact-method', 'address', 'opening-hours']),
    );
  });

  it('requires food and cafe websites to have named menu items with valid prices', () => {
    const readiness = evaluatePublishReadiness(makeWebsite({
      template: restaurantTemplate(),
      menus: [
        { id: 'menu-1', websiteId: 'website-1', name: 'Signature Bowl', price: 'not-a-price', priceCurrency: 'IDR', sortOrder: 1 },
      ],
    }));

    expect(readiness.readyToPublish).toBe(false);
    expect(readiness.required.find((item) => item.key === 'menu-item-exists')?.status).toBe('passed');
    expect(readiness.required.find((item) => item.key === 'menu-price-format')?.status).toBe('missing');
  });

  it('allows publish when all required checks pass and keeps recommended items non-blocking', () => {
    const readiness = evaluatePublishReadiness(makeWebsite({
      template: restaurantTemplate(),
      menus: [
        { id: 'menu-1', websiteId: 'website-1', name: 'Signature Bowl', description: 'Balanced house menu.', price: '58000', priceCurrency: 'IDR', isFeatured: true, sortOrder: 1 },
      ],
      galleries: [],
      theme: { id: 'theme-1', name: 'Default', primaryColor: '#0f766e', secondaryColor: '#f59e0b' },
    }));

    expect(readiness.readyToPublish).toBe(true);
    expect(readiness.required.every((item) => item.status === 'passed')).toBe(true);
    expect(readiness.recommended.some((item) => item.status === 'warning')).toBe(true);
  });

  it('passes a non-food website without menu items', () => {
    const readiness = evaluatePublishReadiness(makeWebsite({
      template: {
        id: 'template-corporate',
        name: 'corporate_executive',
        businessType: 'LOCAL_SERVICE',
        schema: { templateKey: 'corporate_executive', rendererKey: 'corporate' },
      },
      menus: [],
    }));

    expect(readiness.readyToPublish).toBe(true);
    expect(readiness.required.find((item) => item.key === 'menu-item-exists')).toBeUndefined();
  });
});

function makeWebsite(overrides: Partial<Website> = {}): Website {
  return {
    id: 'website-1',
    tenantId: 'tenant-1',
    tenant: { slug: 'stage-911-ready' },
    templateId: 'template-1',
    themeId: 'theme-1',
    status: 'DRAFT',
    businessName: 'Stage 911 Restaurant',
    tagline: 'Launch validation',
    description: 'Publish readiness validation tenant.',
    address: 'Jl. Launch Gate 911, Jakarta',
    phone: '0219110000',
    whatsapp: '08129110000',
    email: 'stage911@example.com',
    mapsUrl: 'https://maps.google.com',
    socialMedia: {},
    openingHours: { mode: 'daily', openTime: '09:00', closeTime: '21:00' },
    template: restaurantTemplate(),
    theme: {
      id: 'theme-1',
      name: 'Default',
      primaryColor: '#0f766e',
      secondaryColor: '#f59e0b',
      logoUrl: '/api/v1/uploads/logo.webp',
      heroImageUrl: '/api/v1/uploads/hero.webp',
    },
    menus: [
      { id: 'menu-1', websiteId: 'website-1', name: 'Signature Bowl', description: 'Balanced house menu.', price: '58000', priceCurrency: 'IDR', isFeatured: true, imageUrl: '/api/v1/uploads/menu.webp', sortOrder: 1 },
      { id: 'menu-2', websiteId: 'website-1', name: 'Chef Plate', description: 'Chef selected plate.', price: '68000', priceCurrency: 'IDR', sortOrder: 2 },
      { id: 'menu-3', websiteId: 'website-1', name: 'Family Platter', description: 'Shared premium plate.', price: '128000', priceCurrency: 'IDR', sortOrder: 3 },
    ],
    galleries: [
      { id: 'gallery-1', imageUrl: '/api/v1/uploads/gallery-1.webp' },
      { id: 'gallery-2', imageUrl: '/api/v1/uploads/gallery-2.webp' },
      { id: 'gallery-3', imageUrl: '/api/v1/uploads/gallery-3.webp' },
    ],
    reviews: [],
    ...overrides,
  };
}

function restaurantTemplate() {
  return {
    id: 'template-1',
    name: 'restaurant_premium',
    businessType: 'RESTAURANT',
    schema: { templateKey: 'restaurant_premium', rendererKey: 'restaurant_premium' },
  };
}
