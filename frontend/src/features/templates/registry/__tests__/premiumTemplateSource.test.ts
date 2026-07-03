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

  it('keeps Restaurant Premium modal aligned to semantic premium tokens', () => {
    const modalSource = readFileSync(resolve('src/features/templates/PremiumFullMenuModal.tsx'), 'utf8');

    expect(modalSource).toContain('var(--premium-modal-background)');
    expect(modalSource).toContain('var(--premium-modal-surface)');
    expect(modalSource).toContain('var(--premium-modal-surface-gradient-from)');
    expect(modalSource).toContain('var(--premium-modal-surface-border)');
    expect(modalSource).toContain('var(--premium-cta-gradient-from)');
    expect(modalSource).toContain('var(--premium-modal-text)');
    expect(modalSource).toContain('#F0D399');
    expect(modalSource).not.toContain('#f7c873');
    expect(modalSource).not.toContain('#120f0b');
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
    const modalSource = readFileSync(resolve('src/features/templates/PremiumFullMenuModal.tsx'), 'utf8');

    expect(source).toContain('Reserve a Table');
    expect(source).toContain('Reserve via WhatsApp');
    expect(source).toContain('Explore Signature Dishes');
    expect(source).toContain('Explore Full Menu');
    expect(source).toContain('Dishes Worth the Visit');
    expect(source).not.toContain('Chat WhatsApp');
    expect(source).not.toContain('Dishes Worth Reserving For');
    expect(source).not.toContain('A concise showcase of the plates that help guests decide quickly');
    expect(modalSource).toContain("variant === 'restaurant' ? undefined");
    expect(modalSource).toContain('Browse signature dishes, favorites, and menu selections.');
    expect(source).not.toContain('TemplateNavigation');
    expect(source).not.toContain('TemplateFooter');
  });

  it('keeps restaurant premium hero free of repeated reservation CTA', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');
    const heroActionResolver = source.match(/function resolvePremiumRestaurantActions[\s\S]*?function resolvePremiumContactActions/);

    expect(heroActionResolver?.[0]).toContain('Explore Signature Dishes');
    expect(heroActionResolver?.[0]).toContain('#signature-dishes');
    expect(heroActionResolver?.[0]).toContain('Get Directions');
    expect(heroActionResolver?.[0]).toContain('#visit-reservation');
    expect(heroActionResolver?.[0]).not.toContain('Reserve a Table');
    expect(heroActionResolver?.[0]).not.toContain('Reserve via WhatsApp');
  });

  it('uses Restaurant Premium depth tokens for buttons and dark surfaces', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('RestaurantPremiumActionLink');
    expect(source).toContain('var(--premium-cta-gradient-from)');
    expect(source).toContain('var(--premium-cta-gradient-to)');
    expect(source).toContain('var(--premium-cta-border)');
    expect(source).toContain('var(--premium-secondary-cta-gradient-from)');
    expect(source).toContain('var(--premium-surface-dark-gradient-from)');
    expect(source).toContain('var(--premium-footer-gradient-from)');
    expect(source).toContain('hover:-translate-y-0.5');
  });

  it('uses stable restaurant premium section anchors for navigation', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('href="#signature-dishes"');
    expect(source).toContain('href="#restaurant-story"');
    expect(source).toContain('href="#ambience-gallery"');
    expect(source).toContain('href="#visit-reservation"');
    expect(source).toContain('id="signature-dishes"');
    expect(source).toContain('id="restaurant-story"');
    expect(source).toContain('id="ambience-gallery"');
    expect(source).toContain('id="visit-reservation"');
    expect(source).not.toContain('href="#contact">Visit');
  });

  it('keeps restaurant premium gallery placeholders readable with semantic tokens', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('text-[var(--premium-text-on-dark)]">{title}</h3>');
    expect(source).toContain('text-[var(--premium-modal-muted-text)]');
    expect(source).not.toContain('text-white/90">Share a sense of the table');
  });

  it('keeps restaurant premium typography tokens local to the renderer', () => {
    const source = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');

    expect(source).toContain('--restaurant-heading-font');
    expect(source).toContain('--restaurant-body-font');
    expect(source).toContain('--restaurant-hero-title-size');
    expect(source).toContain('font-[var(--restaurant-heading-font)]');
  });

  it('keeps login free from tenant slug and moves slug editing into business information', () => {
    const loginSource = readFileSync(resolve('src/features/auth/LoginPage.tsx'), 'utf8');
    const editorSource = readFileSync(resolve('src/features/websites/WebsiteEditorPage.tsx'), 'utf8');

    expect(loginSource).not.toContain('Tenant slug');
    expect(loginSource).not.toContain('setTenantSlug');
    expect(editorSource).toContain('Business slug');
    expect(editorSource).toContain('Changing the slug may change your public website URL.');
  });

  it('uses a structured opening hours picker instead of free-text opening hours input', () => {
    const editorSource = readFileSync(resolve('src/features/websites/WebsiteEditorPage.tsx'), 'utf8');

    expect(editorSource).toContain('function OpeningHoursPicker');
    expect(editorSource).toContain('type="time"');
    expect(editorSource).toContain("mode: 'daily'");
    expect(editorSource).toContain('Monday - Friday');
    expect(editorSource).toContain('Saturday - Sunday');
    expect(editorSource).toContain('Specific days');
    expect(editorSource).not.toContain('placeholder="Daily, 11.00 - 22.00"');
  });
});
