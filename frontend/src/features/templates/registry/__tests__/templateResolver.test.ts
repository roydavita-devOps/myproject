import { describe, expect, it } from 'vitest';
import { Website } from '../../../../types/api';
import { defaultTemplateKey, templateMetadata } from '../templateMetadata';
import { templateRegistry } from '../templateRegistry';
import { resolveTemplate } from '../templateResolver';
import { TemplateKey } from '../templateTypes';

function websiteWithTemplate(template?: { name?: string | null; schema?: Record<string, unknown> | null }) {
  return {
    id: 'website-test',
    tenantId: 'tenant-test',
    templateId: 'template-test',
    status: 'PUBLISHED',
    businessName: 'Registry Test',
    template: template
      ? {
          id: 'template-test',
          name: template.name ?? '',
          businessType: 'CAFE',
          schema: template.schema ?? {},
        }
      : undefined,
  } as Website;
}

describe('resolveTemplate', () => {
  it('maps legacy restaurant default templates to restaurant_classic', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'restaurant-default' }));

    expect(resolved.metadata.key).toBe('restaurant_classic');
    expect(resolved.metadata.rendererKey).toBe('restaurant');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('restaurant'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('maps legacy warteg default templates to restaurant_classic', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'warteg-default' }));

    expect(resolved.metadata.key).toBe('restaurant_classic');
    expect(resolved.metadata.rendererKey).toBe('restaurant');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('restaurant'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('resolves known stable template keys to their registered renderer', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'restaurant_classic' }));

    expect(resolved.metadata.key).toBe('restaurant_classic');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('restaurant'));
    expect(resolved.source).toBe('template-name');
  });

  it('resolves planned premium keys without requiring template implementation', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: 'restaurant_luxury' } }));

    expect(resolved.metadata.key).toBe('restaurant_luxury');
    expect(resolved.metadata.status).toBe('planned');
    expect(resolved.metadata.rendererKey).toBe('restaurant');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('restaurant'));
    expect(resolved.source).toBe('schema-key');
  });

  it('falls back safely for unknown template keys', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'unknown-template' }));

    expect(resolved.metadata.key).toBe(defaultTemplateKey);
    expect(resolved.metadata.key).toBe('minimal_business');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('generic_business'));
    expect(resolved.source).toBe('fallback');
  });

  it('maps legacy laundry default templates to laundry_clean', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'laundry-default' }));

    expect(resolved.metadata.key).toBe('laundry_clean');
    expect(resolved.metadata.rendererKey).toBe('laundry');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('laundry'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('maps legacy clinic default templates to clinic_professional', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'clinic-default' }));

    expect(resolved.metadata.key).toBe('clinic_professional');
    expect(resolved.metadata.rendererKey).toBe('clinic');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('clinic'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('resolves clinic_professional to the clinic renderer through schema key', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: 'clinic_professional' } }));

    expect(resolved.metadata.key).toBe('clinic_professional');
    expect(resolved.metadata.displayName).toBe('Clinic Professional');
    expect(resolved.metadata.status).toBe('active');
    expect(resolved.metadata.rendererKey).toBe('clinic');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('clinic'));
    expect(resolved.source).toBe('schema-key');
  });

  it('resolves clinic renderer schema without business type branching', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { rendererKey: 'clinic' } }));

    expect(resolved.metadata.key).toBe('clinic_professional');
    expect(resolved.metadata.rendererKey).toBe('clinic');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('clinic'));
    expect(resolved.source).toBe('schema-renderer');
  });

  it('maps legacy local service default templates to corporate_executive', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'local-service-default' }));

    expect(resolved.metadata.key).toBe('corporate_executive');
    expect(resolved.metadata.rendererKey).toBe('corporate');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('corporate'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('resolves corporate_executive to the corporate renderer through schema key', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: 'corporate_executive' } }));

    expect(resolved.metadata.key).toBe('corporate_executive');
    expect(resolved.metadata.displayName).toBe('Corporate Executive');
    expect(resolved.metadata.status).toBe('active');
    expect(resolved.metadata.rendererKey).toBe('corporate');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('corporate'));
    expect(resolved.source).toBe('schema-key');
  });

  it('resolves corporate renderer schema without business type branching', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { rendererKey: 'corporate' } }));

    expect(resolved.metadata.key).toBe('corporate_executive');
    expect(resolved.metadata.rendererKey).toBe('corporate');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('corporate'));
    expect(resolved.source).toBe('schema-renderer');
  });

  it('maps legacy cafe default templates to cafe_modern', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: 'cafe-default' }));

    expect(resolved.metadata.key).toBe('cafe_modern');
    expect(resolved.metadata.rendererKey).toBe('cafe');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('cafe'));
    expect(resolved.source).toBe('legacy-name');
  });

  it('resolves cafe_modern to the cafe renderer through schema key', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: 'cafe_modern' } }));

    expect(resolved.metadata.key).toBe('cafe_modern');
    expect(resolved.metadata.displayName).toBe('Cafe Modern');
    expect(resolved.metadata.status).toBe('active');
    expect(resolved.metadata.rendererKey).toBe('cafe');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('cafe'));
    expect(resolved.source).toBe('schema-key');
  });

  it('resolves cafe renderer schema without business type branching', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { rendererKey: 'cafe' } }));

    expect(resolved.metadata.key).toBe('cafe_modern');
    expect(resolved.metadata.rendererKey).toBe('cafe');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('cafe'));
    expect(resolved.source).toBe('schema-renderer');
  });

  it('handles undefined template metadata safely', () => {
    const resolved = resolveTemplate(websiteWithTemplate());

    expect(resolved.metadata.key).toBe(defaultTemplateKey);
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('generic_business'));
    expect(resolved.source).toBe('fallback');
  });

  it('handles null template metadata safely', () => {
    const website = websiteWithTemplate();
    website.template = null as unknown as Website['template'];

    const resolved = resolveTemplate(website);

    expect(resolved.metadata.key).toBe(defaultTemplateKey);
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('generic_business'));
    expect(resolved.source).toBe('fallback');
  });

  it('handles empty schema safely', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ name: '', schema: {} }));

    expect(resolved.metadata.key).toBe(defaultTemplateKey);
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('generic_business'));
    expect(resolved.source).toBe('fallback');
  });

  it('supports future cross-category selection through template key', () => {
    const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: 'restaurant_luxury' } }));

    expect(resolved.metadata.key).toBe('restaurant_luxury');
    expect(resolved.metadata.recommendedBusinessTypes).toContain('CAFE');
    expect(resolved.renderer).toBe(templateRegistry.getRenderer('restaurant'));
  });
});

describe('template registry integrity', () => {
  it('defines metadata and renderer for every supported template key', () => {
    const expectedKeys: TemplateKey[] = [
      'restaurant_classic',
      'restaurant_premium',
      'restaurant_luxury',
      'laundry_clean',
      'cafe_minimal',
      'cafe_modern',
      'cafe_premium',
      'clinic_professional',
      'corporate_executive',
      'minimal_business',
    ];

    expect(Object.keys(templateMetadata).sort()).toEqual([...expectedKeys].sort());

    for (const key of expectedKeys) {
      const metadata = templateMetadata[key];
      expect(metadata.key).toBe(key);
      expect(metadata.displayName.trim().length).toBeGreaterThan(0);
      expect(metadata.description.trim().length).toBeGreaterThan(0);
      expect(metadata.industry.trim().length).toBeGreaterThan(0);
      expect(metadata.category.trim().length).toBeGreaterThan(0);
      expect(metadata.previewImage.trim().length).toBeGreaterThan(0);
      expect(metadata.recommendedBusinessTypes.length).toBeGreaterThan(0);
      expect(templateRegistry.getRenderer(metadata.rendererKey)).toBeTypeOf('function');
    }
  });

  it('ensures active template keys resolve with metadata, renderer, and fallback-safe behavior', () => {
    const activeMetadata = Object.values(templateMetadata).filter((metadata) => metadata.status === 'active');

    expect(activeMetadata.length).toBeGreaterThan(0);

    for (const metadata of activeMetadata) {
      const resolved = resolveTemplate(websiteWithTemplate({ schema: { templateKey: metadata.key } }));
      expect(resolved.metadata).toEqual(metadata);
      expect(resolved.renderer).toBe(templateRegistry.getRenderer(metadata.rendererKey));
    }
  });
});
