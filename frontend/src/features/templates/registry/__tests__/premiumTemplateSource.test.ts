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
});
