import { describe, expect, it } from 'vitest';
import { Website } from '../../../../types/api';
import {
  premiumColorPresets,
  premiumTokenStyles,
  presetsForVariant,
  resolvePremiumColorTokens,
  resolvePremiumVariant,
} from '../../premiumTheme';
import { resolveTemplateTheme } from '../../templateTheme';

function premiumWebsite(templateKey: string, theme?: Website['theme']) {
  return {
    id: 'website-premium-test',
    tenantId: 'tenant-premium-test',
    templateId: 'template-premium-test',
    status: 'PUBLISHED',
    businessName: 'Premium Test',
    template: {
      id: 'template-premium-test',
      name: templateKey,
      businessType: 'RESTAURANT',
      schema: { templateKey },
    },
    theme,
  } as Website;
}

describe('premium theme tokens', () => {
  it('defines the approved restaurant and cafe color presets', () => {
    expect(presetsForVariant('restaurant').map((preset) => preset.key)).toEqual([
      'classic_black_gold',
      'warm_brown',
      'elegant_maroon',
      'deep_green',
      'modern_charcoal',
    ]);
    expect(presetsForVariant('cafe').map((preset) => preset.key)).toEqual([
      'cream_latte',
      'coffee_brown',
      'sage_green',
      'soft_terracotta',
      'minimal_black',
    ]);
    expect(premiumColorPresets).toHaveLength(10);
  });

  it('detects premium template variants from stable template keys', () => {
    expect(resolvePremiumVariant(premiumWebsite('restaurant_premium'))).toBe('restaurant');
    expect(resolvePremiumVariant(premiumWebsite('cafe_premium'))).toBe('cafe');
    expect(resolvePremiumVariant(premiumWebsite('restaurant_classic'))).toBeNull();
  });

  it('uses saved preset and custom brand colors without changing template keys', () => {
    const tokens = resolvePremiumColorTokens(
      premiumWebsite('cafe_premium', {
        id: 'theme-test',
        name: 'Brand Theme',
        primaryColor: '#123456',
        secondaryColor: '#f59e0b',
        accentColor: '#abcdef',
        typography: { premiumColorPreset: 'sage_green' },
      }),
    );

    expect(tokens.primary).toBe('#123456');
    expect(tokens.accent).toBe('#abcdef');
    expect(tokens.background).toBe('#f3f6ed');
    expect(tokens.buttonPrimary).toBe('#123456');
  });

  it('exposes premium tokens as template CSS variables', () => {
    const style = resolveTemplateTheme(premiumWebsite('restaurant_premium', {
      id: 'theme-test',
      name: 'Brand Theme',
      primaryColor: '#561c24',
      secondaryColor: '#f59e0b',
      accentColor: '#d6a650',
      typography: { premiumColorPreset: 'elegant_maroon' },
    }));

    expect(style['--premium-primary' as keyof typeof style]).toBe('#561c24');
    expect(style['--premium-accent' as keyof typeof style]).toBe('#d6a650');
    expect(style['--tpl-background' as keyof typeof style]).toBe('#fff7f1');
  });

  it('does not apply premium-only CSS variables to standard templates', () => {
    const style = resolveTemplateTheme(premiumWebsite('restaurant_classic'));

    expect(style['--premium-primary' as keyof typeof style]).toBeUndefined();
    expect(style['--tpl-background' as keyof typeof style]).toBeUndefined();
  });

  it('maps token objects to CSS custom properties used by premium templates', () => {
    const tokens = resolvePremiumColorTokens(premiumWebsite('restaurant_premium'));
    const style = premiumTokenStyles(tokens);

    expect(style['--premium-button-primary' as keyof typeof style]).toBe(tokens.buttonPrimary);
    expect(style['--premium-button-primary-text' as keyof typeof style]).toBe(tokens.buttonPrimaryText);
    expect(style['--premium-hero-overlay' as keyof typeof style]).toBe(tokens.heroOverlay);
  });
});
