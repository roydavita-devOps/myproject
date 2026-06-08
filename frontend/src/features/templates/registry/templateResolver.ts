import { Website } from '../../../types/api';
import { defaultTemplateKey, isTemplateKey, legacyTemplateNameAliases, templateMetadata } from './templateMetadata';
import { templateRegistry } from './templateRegistry';
import { TemplateKey, TemplateRendererKey, TemplateResolution } from './templateTypes';

type TemplateSchema = {
  key?: string;
  templateKey?: string;
  rendererKey?: string;
};

export function resolveTemplate(website: Website): TemplateResolution {
  const schema = (website.template?.schema ?? {}) as TemplateSchema;
  const schemaTemplateKey = normalizeKey(schema.templateKey ?? schema.key);

  if (isTemplateKey(schemaTemplateKey)) {
    return resolutionFor(schemaTemplateKey, 'schema-key');
  }

  const schemaRendererKey = normalizeKey(schema.rendererKey);
  if (isRendererKey(schemaRendererKey)) {
    const metadata = Object.values(templateMetadata).find((item) => item.rendererKey === schemaRendererKey) ?? templateMetadata[defaultTemplateKey];
    return {
      metadata,
      renderer: templateRegistry.getRenderer(schemaRendererKey),
      source: 'schema-renderer',
    };
  }

  const normalizedName = normalizeKey(website.template?.name);
  if (isTemplateKey(normalizedName)) {
    return resolutionFor(normalizedName, 'template-name');
  }

  const legacyKey = normalizedName ? legacyTemplateNameAliases[normalizedName] : undefined;
  if (legacyKey) {
    return resolutionFor(legacyKey, 'legacy-name');
  }

  return resolutionFor(defaultTemplateKey, 'fallback');
}

function resolutionFor(key: TemplateKey, source: TemplateResolution['source']): TemplateResolution {
  const metadata = templateMetadata[key];
  return {
    metadata,
    renderer: templateRegistry.getRenderer(metadata.rendererKey),
    source,
  };
}

function isRendererKey(value?: string | null): value is TemplateRendererKey {
  return value === 'restaurant' || value === 'generic_business';
}

function normalizeKey(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}
