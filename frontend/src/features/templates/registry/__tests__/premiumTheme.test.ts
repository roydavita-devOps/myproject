import { describe, expect, it } from 'vitest';
import { Website } from '../../../../types/api';
import {
  ensureContrastColor,
  getReadableTextColor,
  isLightColor,
  normalizeHexColor,
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
    expect(tokens.buttonPrimaryText).toBe('#ffffff');
    expect(tokens.textPrimary).not.toBe(tokens.accent);
    expect(tokens.textSecondary).not.toBe(tokens.accent);
  });

  it('falls back safely when custom brand colors are invalid', () => {
    const tokens = resolvePremiumColorTokens(
      premiumWebsite('restaurant_premium', {
        id: 'theme-test',
        name: 'Brand Theme',
        primaryColor: 'not-a-color',
        secondaryColor: '#f59e0b',
        accentColor: '#123',
        typography: { premiumColorPreset: 'warm_brown' },
      }),
    );

    expect(tokens.primary).toBe('#4a2f1f');
    expect(tokens.accent).toBe('#d99a45');
    expect(tokens.buttonPrimaryText).toBe('#ffffff');
  });

  it('provides readable text color helpers for light and dark backgrounds', () => {
    expect(normalizeHexColor('bad-value', '#ffffff')).toBe('#ffffff');
    expect(isLightColor('#ffffff')).toBe(true);
    expect(isLightColor('#111827')).toBe(false);
    expect(getReadableTextColor('#ffffff')).toBe('#111827');
    expect(getReadableTextColor('#111827')).toBe('#ffffff');
    expect(ensureContrastColor('#f7c873', '#fffaf1', '#111827')).toBe('#111827');
  });

  it('generates contrast-safe semantic tokens for every premium preset', () => {
    for (const preset of premiumColorPresets) {
      const tokens = resolvePremiumColorTokens(
        premiumWebsite(preset.variant === 'restaurant' ? 'restaurant_premium' : 'cafe_premium', {
          id: `theme-${preset.key}`,
          name: preset.label,
          primaryColor: preset.tokens.primary,
          secondaryColor: '#f59e0b',
          accentColor: preset.tokens.accent,
          typography: { premiumColorPreset: preset.key },
        }),
      );

      expect(tokens.textPrimary).not.toBe(tokens.accent);
      expect(tokens.textSecondary).not.toBe(tokens.accent);
      expect(tokens.buttonPrimaryText).toBe(getReadableTextColor(tokens.buttonPrimary));
      expect(tokens.buttonSecondaryText).toBe(getReadableTextColor(tokens.buttonSecondary));
      expect(tokens.cardOverlayText).toBeTruthy();
      expect(tokens.heroScrim).toContain('linear-gradient');
    }
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
    expect(style['--premium-text-primary' as keyof typeof style]).toBeTruthy();
    expect(style['--premium-surface-dark' as keyof typeof style]).toBe('#561c24');
    expect(style['--premium-hero-scrim' as keyof typeof style]).toBeTruthy();
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
    expect(style['--premium-card-overlay' as keyof typeof style]).toBe(tokens.cardOverlay);
  });
});
