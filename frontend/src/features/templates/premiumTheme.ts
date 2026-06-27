import { CSSProperties } from 'react';
import { Website } from '../../types/api';

export type PremiumTemplateVariant = 'restaurant' | 'cafe';

export type PremiumColorTokens = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  textOnDark?: string;
  textOnLight?: string;
  textOnAccent?: string;
  surfacePrimary?: string;
  surfaceSecondary?: string;
  surfaceElevated?: string;
  surfaceDark?: string;
  surfaceGlass?: string;
  borderSubtle?: string;
  borderStrong?: string;
  accentSoft?: string;
  accentContrast?: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  heroOverlay: string;
  heroScrim?: string;
  cardOverlay?: string;
  cardOverlayText?: string;
};

export type PremiumColorPreset = {
  key: string;
  label: string;
  variant: PremiumTemplateVariant;
  tokens: PremiumColorTokens;
};

export const premiumColorPresets: PremiumColorPreset[] = [
  restaurantPreset('classic_black_gold', 'Classic Black Gold', {
    primary: '#17120c',
    accent: '#f7c873',
    background: '#fff8ed',
    surface: '#fffaf1',
    text: '#1f1710',
    mutedText: '#6b5741',
    border: '#ead8b8',
    buttonPrimary: '#17120c',
    buttonPrimaryText: '#f7c873',
    buttonSecondary: '#fffaf1',
    buttonSecondaryText: '#17120c',
    heroOverlay: 'linear-gradient(90deg,rgba(18,15,11,.97),rgba(18,15,11,.72),rgba(18,15,11,.26))',
  }),
  restaurantPreset('warm_brown', 'Warm Brown', {
    primary: '#4a2f1f',
    accent: '#d99a45',
    background: '#fff6ea',
    surface: '#fffaf2',
    text: '#2c1b12',
    mutedText: '#74523c',
    border: '#e5c8a5',
    buttonPrimary: '#4a2f1f',
    buttonPrimaryText: '#fff8ed',
    buttonSecondary: '#fff1dc',
    buttonSecondaryText: '#3a2418',
    heroOverlay: 'linear-gradient(90deg,rgba(52,32,19,.95),rgba(74,47,31,.68),rgba(74,47,31,.18))',
  }),
  restaurantPreset('elegant_maroon', 'Elegant Maroon', {
    primary: '#561c24',
    accent: '#d6a650',
    background: '#fff7f1',
    surface: '#fffaf5',
    text: '#271417',
    mutedText: '#704f52',
    border: '#e7c5bd',
    buttonPrimary: '#561c24',
    buttonPrimaryText: '#fff6e8',
    buttonSecondary: '#fff5ec',
    buttonSecondaryText: '#561c24',
    heroOverlay: 'linear-gradient(90deg,rgba(50,13,19,.96),rgba(86,28,36,.70),rgba(86,28,36,.22))',
  }),
  restaurantPreset('deep_green', 'Deep Green', {
    primary: '#163b2f',
    accent: '#c7a45a',
    background: '#f6fbf4',
    surface: '#ffffff',
    text: '#10221c',
    mutedText: '#53665e',
    border: '#c8d8cf',
    buttonPrimary: '#163b2f',
    buttonPrimaryText: '#fff7df',
    buttonSecondary: '#f4f8ef',
    buttonSecondaryText: '#163b2f',
    heroOverlay: 'linear-gradient(90deg,rgba(12,33,27,.96),rgba(22,59,47,.72),rgba(22,59,47,.22))',
  }),
  restaurantPreset('modern_charcoal', 'Modern Charcoal', {
    primary: '#1f2937',
    accent: '#e0b15c',
    background: '#f7f4ef',
    surface: '#ffffff',
    text: '#111827',
    mutedText: '#5b6472',
    border: '#d9d3c9',
    buttonPrimary: '#1f2937',
    buttonPrimaryText: '#fff7e6',
    buttonSecondary: '#ffffff',
    buttonSecondaryText: '#1f2937',
    heroOverlay: 'linear-gradient(90deg,rgba(17,24,39,.96),rgba(31,41,55,.72),rgba(31,41,55,.20))',
  }),
  cafePreset('cream_latte', 'Cream Latte', {
    primary: '#7a4a24',
    accent: '#d69a58',
    background: '#fbf3e7',
    surface: '#fffaf2',
    text: '#2f1f16',
    mutedText: '#72523d',
    border: '#ead3b5',
    buttonPrimary: '#7a4a24',
    buttonPrimaryText: '#fff8ed',
    buttonSecondary: '#ffffff',
    buttonSecondaryText: '#2f1f16',
    heroOverlay: 'radial-gradient(circle_at_12%_18%,rgba(120,69,31,.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(214,154,88,.24),transparent_26%)',
  }),
  cafePreset('coffee_brown', 'Coffee Brown', {
    primary: '#4b2e23',
    accent: '#c9884b',
    background: '#f8efe5',
    surface: '#fff9f1',
    text: '#261810',
    mutedText: '#684a39',
    border: '#dfc4aa',
    buttonPrimary: '#4b2e23',
    buttonPrimaryText: '#fff7ed',
    buttonSecondary: '#fffaf2',
    buttonSecondaryText: '#4b2e23',
    heroOverlay: 'radial-gradient(circle_at_18%_18%,rgba(75,46,35,.18),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(201,136,75,.26),transparent_28%)',
  }),
  cafePreset('sage_green', 'Sage Green', {
    primary: '#4f6f52',
    accent: '#c28f5c',
    background: '#f3f6ed',
    surface: '#ffffff',
    text: '#1f2d23',
    mutedText: '#596b5d',
    border: '#d2ddc8',
    buttonPrimary: '#4f6f52',
    buttonPrimaryText: '#fff8ed',
    buttonSecondary: '#ffffff',
    buttonSecondaryText: '#324936',
    heroOverlay: 'radial-gradient(circle_at_16%_18%,rgba(79,111,82,.18),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(194,143,92,.22),transparent_26%)',
  }),
  cafePreset('soft_terracotta', 'Soft Terracotta', {
    primary: '#9a4f35',
    accent: '#e3a261',
    background: '#fff1e8',
    surface: '#fffaf5',
    text: '#321d16',
    mutedText: '#735246',
    border: '#e9c4b4',
    buttonPrimary: '#9a4f35',
    buttonPrimaryText: '#fff8ed',
    buttonSecondary: '#fff7ef',
    buttonSecondaryText: '#703824',
    heroOverlay: 'radial-gradient(circle_at_16%_16%,rgba(154,79,53,.18),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(227,162,97,.26),transparent_26%)',
  }),
  cafePreset('minimal_black', 'Minimal Black', {
    primary: '#18181b',
    accent: '#d4a373',
    background: '#f7f5f0',
    surface: '#ffffff',
    text: '#18181b',
    mutedText: '#5f5a54',
    border: '#ded8cf',
    buttonPrimary: '#18181b',
    buttonPrimaryText: '#fff7ed',
    buttonSecondary: '#ffffff',
    buttonSecondaryText: '#18181b',
    heroOverlay: 'radial-gradient(circle_at_12%_18%,rgba(24,24,27,.12),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(212,163,115,.24),transparent_26%)',
  }),
];

export function presetsForVariant(variant: PremiumTemplateVariant) {
  return premiumColorPresets.filter((preset) => preset.variant === variant);
}

export function resolvePremiumVariant(website: Website): PremiumTemplateVariant | null {
  const schema = website.template?.schema as { templateKey?: string; rendererKey?: string } | undefined;
  const key = schema?.templateKey ?? schema?.rendererKey ?? website.template?.name;
  if (key === 'restaurant_premium') return 'restaurant';
  if (key === 'cafe_premium') return 'cafe';
  return null;
}

export function resolvePremiumColorTokens(website: Website): PremiumColorTokens {
  const variant = resolvePremiumVariant(website) ?? 'restaurant';
  const presetKey = website.theme?.typography?.premiumColorPreset;
  const variantPresets = presetsForVariant(variant);
  const preset = premiumColorPresets.find((item) => item.key === presetKey && item.variant === variant)
    ?? variantPresets[0]
    ?? premiumColorPresets[0];
  if (!preset) return fallbackPremiumTokens;
  const primary = safeColor(website.theme?.primaryColor, preset.tokens.primary);
  const accent = safeColor(website.theme?.accentColor, preset.tokens.accent);
  const textPrimary = ensureContrastColor(preset.tokens.textPrimary ?? preset.tokens.text, preset.tokens.background, '#111827');
  const textSecondary = ensureContrastColor(preset.tokens.textSecondary ?? preset.tokens.mutedText, preset.tokens.surface, '#334155');
  const surfaceDark = primary;
  const accentContrast = getReadableTextColor(accent);

  return {
    ...preset.tokens,
    primary,
    accent,
    text: textPrimary,
    mutedText: textSecondary,
    textPrimary,
    textSecondary,
    textMuted: ensureContrastColor(preset.tokens.textMuted ?? preset.tokens.mutedText, preset.tokens.surface, '#475569'),
    textOnDark: '#ffffff',
    textOnLight: '#111827',
    textOnAccent: accentContrast,
    surfaceDark,
    surfaceGlass: isLightColor(primary) ? 'rgba(17,24,39,.90)' : 'rgba(17,24,39,.82)',
    borderStrong: accent,
    accentSoft: withAlpha(accent, 0.18),
    accentContrast,
    buttonPrimary: primary,
    buttonPrimaryText: getReadableTextColor(primary),
    buttonSecondary: preset.tokens.surface,
    buttonSecondaryText: getReadableTextColor(preset.tokens.surface),
    heroScrim: 'linear-gradient(90deg,rgba(10,10,10,.72),rgba(10,10,10,.48),rgba(10,10,10,.28))',
    cardOverlay: isLightColor(primary) ? 'rgba(17,24,39,.92)' : 'rgba(255,255,255,.94)',
    cardOverlayText: isLightColor(primary) ? '#ffffff' : '#111827',
  };
}

export function premiumTokenStyles(tokens: PremiumColorTokens): CSSProperties {
  return {
    '--premium-primary': tokens.primary,
    '--premium-accent': tokens.accent,
    '--premium-background': tokens.background,
    '--premium-surface': tokens.surface,
    '--premium-text': tokens.text,
    '--premium-muted': tokens.mutedText,
    '--premium-border': tokens.border,
    '--premium-text-primary': tokens.textPrimary,
    '--premium-text-secondary': tokens.textSecondary,
    '--premium-text-muted': tokens.textMuted,
    '--premium-text-on-dark': tokens.textOnDark,
    '--premium-text-on-light': tokens.textOnLight,
    '--premium-text-on-accent': tokens.textOnAccent,
    '--premium-surface-primary': tokens.surfacePrimary,
    '--premium-surface-secondary': tokens.surfaceSecondary,
    '--premium-surface-elevated': tokens.surfaceElevated,
    '--premium-surface-dark': tokens.surfaceDark,
    '--premium-surface-glass': tokens.surfaceGlass,
    '--premium-border-subtle': tokens.borderSubtle,
    '--premium-border-strong': tokens.borderStrong,
    '--premium-accent-soft': tokens.accentSoft,
    '--premium-accent-contrast': tokens.accentContrast,
    '--premium-button-primary': tokens.buttonPrimary,
    '--premium-button-primary-text': tokens.buttonPrimaryText,
    '--premium-button-secondary': tokens.buttonSecondary,
    '--premium-button-secondary-text': tokens.buttonSecondaryText,
    '--premium-hero-overlay': tokens.heroOverlay,
    '--premium-hero-scrim': tokens.heroScrim,
    '--premium-card-overlay': tokens.cardOverlay,
    '--premium-card-overlay-text': tokens.cardOverlayText,
  } as CSSProperties;
}

export function isValidHexColor(value?: string | null) {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
}

export function normalizeHexColor(value: string | null | undefined, fallback = '#111827'): string {
  return isValidHexColor(value) ? value as string : fallback;
}

export function isLightColor(hex: string) {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) > 0.58;
}

export function getReadableTextColor(background: string) {
  return isLightColor(background) ? '#111827' : '#ffffff';
}

export function ensureContrastColor(candidate: string | null | undefined, background: string, fallback = '#111827') {
  const color = normalizeHexColor(candidate, fallback);
  return isLightColor(color) === isLightColor(background) ? getReadableTextColor(background) : color;
}

function safeColor(value: string | null | undefined, fallback: string): string {
  return isValidHexColor(value) ? value as string : fallback;
}

function restaurantPreset(key: string, label: string, tokens: PremiumColorTokens): PremiumColorPreset {
  return { key, label, variant: 'restaurant', tokens: enrichTokens(tokens) };
}

function cafePreset(key: string, label: string, tokens: PremiumColorTokens): PremiumColorPreset {
  return { key, label, variant: 'cafe', tokens: enrichTokens(tokens) };
}

function enrichTokens(tokens: PremiumColorTokens): PremiumColorTokens {
  const textPrimary = ensureContrastColor(tokens.textPrimary ?? tokens.text, tokens.background, '#111827');
  const textSecondary = ensureContrastColor(tokens.textSecondary ?? tokens.mutedText, tokens.surface, '#334155');
  const textMuted = ensureContrastColor(tokens.textMuted ?? tokens.mutedText, tokens.surface, '#475569');
  return {
    ...tokens,
    text: textPrimary,
    mutedText: textSecondary,
    textPrimary,
    textSecondary,
    textMuted,
    textOnDark: tokens.textOnDark ?? '#ffffff',
    textOnLight: tokens.textOnLight ?? '#111827',
    textOnAccent: tokens.textOnAccent ?? getReadableTextColor(tokens.accent),
    surfacePrimary: tokens.surfacePrimary ?? tokens.background,
    surfaceSecondary: tokens.surfaceSecondary ?? tokens.surface,
    surfaceElevated: tokens.surfaceElevated ?? '#ffffff',
    surfaceDark: tokens.surfaceDark ?? tokens.primary,
    surfaceGlass: tokens.surfaceGlass ?? 'rgba(17,24,39,.88)',
    borderSubtle: tokens.borderSubtle ?? tokens.border,
    borderStrong: tokens.borderStrong ?? tokens.accent,
    accentSoft: tokens.accentSoft ?? withAlpha(tokens.accent, 0.18),
    accentContrast: tokens.accentContrast ?? getReadableTextColor(tokens.accent),
    heroScrim: tokens.heroScrim ?? 'linear-gradient(90deg,rgba(10,10,10,.72),rgba(10,10,10,.48),rgba(10,10,10,.28))',
    cardOverlay: tokens.cardOverlay ?? 'rgba(255,255,255,.94)',
    cardOverlayText: tokens.cardOverlayText ?? '#111827',
  };
}

function withAlpha(hex: string, alpha: number) {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const fallbackPremiumTokens: PremiumColorTokens = {
  primary: '#17120c',
  accent: '#f7c873',
  background: '#fff8ed',
  surface: '#fffaf1',
  text: '#1f1710',
  mutedText: '#6b5741',
  border: '#ead8b8',
  textPrimary: '#1f1710',
  textSecondary: '#514231',
  textMuted: '#5f4e3b',
  textOnDark: '#ffffff',
  textOnLight: '#111827',
  textOnAccent: '#111827',
  surfacePrimary: '#fff8ed',
  surfaceSecondary: '#fffaf1',
  surfaceElevated: '#ffffff',
  surfaceDark: '#17120c',
  surfaceGlass: 'rgba(17,24,39,.90)',
  borderSubtle: '#ead8b8',
  borderStrong: '#f7c873',
  accentSoft: 'rgba(247,200,115,.20)',
  accentContrast: '#111827',
  buttonPrimary: '#17120c',
  buttonPrimaryText: '#f7c873',
  buttonSecondary: '#fffaf1',
  buttonSecondaryText: '#17120c',
  heroOverlay: 'linear-gradient(90deg,rgba(18,15,11,.97),rgba(18,15,11,.72),rgba(18,15,11,.26))',
  heroScrim: 'linear-gradient(90deg,rgba(10,10,10,.78),rgba(10,10,10,.48),rgba(10,10,10,.30))',
  cardOverlay: 'rgba(255,255,255,.94)',
  cardOverlayText: '#111827',
};
