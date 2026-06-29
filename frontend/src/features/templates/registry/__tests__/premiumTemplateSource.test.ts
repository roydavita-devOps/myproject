import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const premiumTemplateFiles = [
  'src/features/templates/RestaurantPremiumTemplate.tsx',
  'src/features/templates/CafePremiumTemplate.tsx',
];

describe('premium template source readability rules', () => {
  it('does not use the legacy hardcoded blue CTA color in premium templates', () => {
    for (const file of premiumTemplateFiles) {
      const source = readFileSync(resolve(file), 'utf8');
      expect(source).not.toContain('#2563eb');
    }
  });

  it('does not apply accent color directly to paragraph-level text classes', () => {
    for (const file of premiumTemplateFiles) {
      const source = readFileSync(resolve(file), 'utf8');
      expect(source).not.toMatch(/<p[^>]*text-\[var\(--premium-accent\)\]/);
      expect(source).not.toMatch(/tpl-body[^"']*text-\[var\(--premium-accent\)\]/);
    }
  });

  it('keeps restaurant premium CTA language reservation-first and avoids generic repeated WhatsApp CTAs', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('Reserve a Table');
    expect(source).toContain('Reserve via WhatsApp');
    expect(source).toContain('Explore Signature Dishes');
    expect(source).toContain('Explore Full Menu');
    expect(source).not.toContain('Chat WhatsApp');
    expect(source).not.toContain('TemplateNavigation');
    expect(source).not.toContain('TemplateFooter');
  });

  it('keeps restaurant premium hero free of repeated reservation CTA', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');
    const heroActionResolver = source.match(/function resolvePremiumRestaurantActions[\s\S]*?function resolvePremiumContactActions/);

    expect(heroActionResolver?.[0]).toContain('Explore Signature Dishes');
    expect(heroActionResolver?.[0]).toContain('Get Directions');
    expect(heroActionResolver?.[0]).not.toContain('Reserve a Table');
    expect(heroActionResolver?.[0]).not.toContain('Reserve via WhatsApp');
  });

  it('keeps restaurant premium typography tokens local to the renderer', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('--restaurant-heading-font');
    expect(source).toContain('--restaurant-body-font');
    expect(source).toContain('--restaurant-hero-title-size');
    expect(source).toContain('font-[var(--restaurant-heading-font)]');
  });
});
