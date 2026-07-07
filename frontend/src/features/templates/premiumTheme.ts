import { CSSProperties } from 'react';
import { Website } from '../../types/api';

export type PremiumTemplateVariant = 'restaurant' | 'cafe';

export type PremiumColorTokens = {
  primary: string;
  accent: string;
  background: string;
  backgroundAlt?: string;
  surface: string;
  surfaceMuted?: string;
  text: string;
  mutedText: string;
  border: string;
  heading?: string;
  eyebrow?: string;
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
  accentMuted?: string;
  accentContrast?: string;
  cta?: string;
  ctaHover?: string;
  ctaText?: string;
  ctaGradientFrom?: string;
  ctaGradientTo?: string;
  ctaHoverGradientFrom?: string;
  ctaHoverGradientTo?: string;
  ctaBorder?: string;
  ctaShadow?: string;
  ctaInnerHighlight?: string;
  secondaryCta?: string;
  secondaryCtaText?: string;
  secondaryCtaGradientFrom?: string;
  secondaryCtaGradientTo?: string;
  secondaryCtaBorder?: string;
  secondaryCtaShadow?: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  heroOverlay: string;
  heroScrim?: string;
  heroText?: string;
  heroMutedText?: string;
  heroCardBackground?: string;
  heroCardText?: string;
  surfaceDarkGradientFrom?: string;
  surfaceDarkGradientTo?: string;
  surfaceDarkBorder?: string;
  surfaceDarkShadow?: string;
  footerGradientFrom?: string;
  footerGradientTo?: string;
  footerTopBorder?: string;
  modalBackground?: string;
  modalSurface?: string;
  modalSurfaceGradientFrom?: string;
  modalSurfaceGradientTo?: string;
  modalSurfaceBorder?: string;
  modalText?: string;
  modalMutedText?: string;
  modalBorder?: string;
  priceText?: string;
  badgeBackground?: string;
  badgeText?: string;
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
  restaurantPreset('editorial_umber', 'Editorial Umber', {
    primary: '#6B3F24',
    accent: '#B88746',
    background: '#F7F0E6',
    backgroundAlt: '#FFF8EF',
    surface: '#FFF9F0',
    surfaceElevated: '#FDF3E6',
    surfaceDark: '#211A14',
    text: '#1E1712',
    mutedText: '#5A4A3D',
    textMuted: '#7A6A5A',
    textOnDark: '#FFF7EA',
    accentSoft: '#E9D3B0',
    border: '#D8C2A3',
    buttonPrimary: '#6B3F24',
    buttonPrimaryText: '#FFF8EF',
    buttonSecondary: '#FFF9F0',
    buttonSecondaryText: '#1E1712',
    heroOverlay: 'linear-gradient(90deg,rgba(22,16,11,.94),rgba(33,26,20,.74),rgba(33,26,20,.32))',
  }),
  restaurantPreset('charcoal_gold', 'Charcoal Gold', {
    primary: '#191919',
    accent: '#C9A15A',
    background: '#F8F4EC',
    backgroundAlt: '#FFFDF7',
    surface: '#FFFDF7',
    surfaceElevated: '#F4EBDD',
    surfaceDark: '#151515',
    text: '#17120E',
    mutedText: '#4D4438',
    textOnDark: '#FFF8EA',
    accentSoft: '#E9D8B3',
    border: '#D6C5AA',
    buttonPrimary: '#191919',
    buttonPrimaryText: '#FFF8EA',
    buttonSecondary: '#FFFDF7',
    buttonSecondaryText: '#17120E',
    heroOverlay: 'linear-gradient(90deg,rgba(12,12,12,.96),rgba(21,21,21,.76),rgba(21,21,21,.34))',
  }),
  restaurantPreset('olive_cream', 'Olive Cream', {
    primary: '#2F5B49',
    accent: '#B99B5B',
    background: '#F5F0E4',
    backgroundAlt: '#FFF9ED',
    surface: '#FFF9ED',
    surfaceElevated: '#F1E8D6',
    surfaceDark: '#1D2A21',
    text: '#132018',
    mutedText: '#4A5A4B',
    textOnDark: '#F9F3E7',
    accentSoft: '#E2D2AA',
    border: '#CDBF9D',
    buttonPrimary: '#2F5B49',
    buttonPrimaryText: '#FFF9ED',
    buttonSecondary: '#FFF9ED',
    buttonSecondaryText: '#132018',
    heroOverlay: 'linear-gradient(90deg,rgba(12,24,17,.95),rgba(29,42,33,.76),rgba(29,42,33,.34))',
  }),
  restaurantPreset('burgundy_linen', 'Burgundy Linen', {
    primary: '#6B1F2B',
    accent: '#B56A45',
    background: '#F8EFE5',
    backgroundAlt: '#FFF7EF',
    surface: '#FFF7EF',
    surfaceElevated: '#F2E0D2',
    surfaceDark: '#311116',
    text: '#24130F',
    mutedText: '#5C4038',
    textOnDark: '#FFF3E8',
    accentSoft: '#E6C3AF',
    border: '#D9B9A4',
    buttonPrimary: '#6B1F2B',
    buttonPrimaryText: '#FFF3E8',
    buttonSecondary: '#FFF7EF',
    buttonSecondaryText: '#24130F',
    heroOverlay: 'linear-gradient(90deg,rgba(37,10,14,.96),rgba(49,17,22,.76),rgba(49,17,22,.34))',
  }),
  restaurantPreset('espresso_copper', 'Espresso Copper', {
    primary: '#3C2215',
    accent: '#B66D3C',
    background: '#F4EBDD',
    backgroundAlt: '#FFF8EC',
    surface: '#FFF8EC',
    surfaceElevated: '#EBDCC7',
    surfaceDark: '#1F130D',
    text: '#1B120D',
    mutedText: '#574238',
    textOnDark: '#FFF5E7',
    accentSoft: '#E4B98D',
    border: '#D4B99D',
    buttonPrimary: '#3C2215',
    buttonPrimaryText: '#FFF5E7',
    buttonSecondary: '#FFF8EC',
    buttonSecondaryText: '#1B120D',
    heroOverlay: 'linear-gradient(90deg,rgba(28,15,9,.96),rgba(31,19,13,.76),rgba(31,19,13,.34))',
  }),
  cafePreset('roasted_cream', 'Roasted Cream', {
    primary: '#6F4324',
    accent: '#D9A15F',
    background: '#FBF0E0',
    backgroundAlt: '#FFF8EE',
    surface: '#FFF8EE',
    surfaceElevated: '#F6E4CC',
    surfaceDark: '#2F1E15',
    text: '#281A12',
    mutedText: '#684D3C',
    border: '#E3C6A3',
    buttonPrimary: '#6F4324',
    buttonPrimaryText: '#FFF8EE',
    buttonSecondary: '#FFF8EE',
    buttonSecondaryText: '#281A12',
    heroOverlay: 'radial-gradient(circle_at_12%_18%,rgba(111,67,36,.20),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(217,161,95,.28),transparent_26%)',
  }),
  cafePreset('espresso_linen', 'Espresso Linen', {
    primary: '#3C2518',
    accent: '#C8894D',
    background: '#F7EDE0',
    backgroundAlt: '#FFF8EF',
    surface: '#FFF8EF',
    surfaceElevated: '#EEDCC6',
    surfaceDark: '#21140E',
    text: '#24170F',
    mutedText: '#604739',
    border: '#D9BFA3',
    buttonPrimary: '#3C2518',
    buttonPrimaryText: '#FFF8EF',
    buttonSecondary: '#FFF8EF',
    buttonSecondaryText: '#24170F',
    heroOverlay: 'radial-gradient(circle_at_18%_18%,rgba(60,37,24,.22),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(200,137,77,.30),transparent_28%)',
  }),
  cafePreset('matcha_cream', 'Matcha Cream', {
    primary: '#4F6F52',
    accent: '#C6905A',
    background: '#F4F5E9',
    backgroundAlt: '#FFF9EC',
    surface: '#FFF9EC',
    surfaceElevated: '#E7EBD7',
    surfaceDark: '#223127',
    text: '#1D2A20',
    mutedText: '#566555',
    border: '#CFD9BF',
    buttonPrimary: '#4F6F52',
    buttonPrimaryText: '#FFF9EC',
    buttonSecondary: '#FFF9EC',
    buttonSecondaryText: '#2E4332',
    heroOverlay: 'radial-gradient(circle_at_16%_18%,rgba(79,111,82,.20),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(198,144,90,.25),transparent_26%)',
  }),
  cafePreset('caramel_noir', 'Caramel Noir', {
    primary: '#1F1A16',
    accent: '#D3A064',
    background: '#F5EFE7',
    backgroundAlt: '#FFF8EE',
    surface: '#FFF8EE',
    surfaceElevated: '#EFE1D0',
    surfaceDark: '#17120F',
    text: '#1F1A16',
    mutedText: '#5B5248',
    border: '#D8C7B5',
    buttonPrimary: '#1F1A16',
    buttonPrimaryText: '#FFF8EE',
    buttonSecondary: '#FFF8EE',
    buttonSecondaryText: '#1F1A16',
    heroOverlay: 'radial-gradient(circle_at_12%_18%,rgba(31,26,22,.18),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(211,160,100,.28),transparent_26%)',
  }),
  cafePreset('terracotta_milk', 'Terracotta Milk', {
    primary: '#9A4F35',
    accent: '#E2A05E',
    background: '#FFF1E8',
    backgroundAlt: '#FFF8EF',
    surface: '#FFF8EF',
    surfaceElevated: '#F3DCCF',
    surfaceDark: '#3A2118',
    text: '#321D16',
    mutedText: '#735246',
    border: '#E5C0AE',
    buttonPrimary: '#9A4F35',
    buttonPrimaryText: '#FFF8EF',
    buttonSecondary: '#FFF8EF',
    buttonSecondaryText: '#703824',
    heroOverlay: 'radial-gradient(circle_at_16%_16%,rgba(154,79,53,.20),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(226,160,94,.30),transparent_26%)',
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
  const safeCta = ensureCtaColor(primary, preset.tokens.cta ?? preset.tokens.buttonPrimary);
  const safeCtaText = getReadableTextColor(safeCta);
  const textPrimary = ensureContrastColor(preset.tokens.textPrimary ?? preset.tokens.text, preset.tokens.background, '#111827');
  const textSecondary = ensureContrastColor(preset.tokens.textSecondary ?? preset.tokens.mutedText, preset.tokens.surface, '#334155');
  const surfaceDark = preset.tokens.surfaceDark ?? (isLightColor(primary) ? '#171717' : primary);
  const accentContrast = getReadableTextColor(accent);
  const ctaHover = darkenColor(safeCta, 0.2);
  const surfaceDarkGradientFrom = preset.tokens.surfaceDarkGradientFrom ?? mixColor(surfaceDark, accent, 0.12);
  const surfaceDarkGradientTo = preset.tokens.surfaceDarkGradientTo ?? darkenColor(surfaceDark, 0.14);
  const modalSurface = preset.tokens.modalSurface ?? mixColor(surfaceDark, '#ffffff', 0.08);

  return {
    ...preset.tokens,
    primary,
    accent,
    text: textPrimary,
    mutedText: textSecondary,
    textPrimary,
    textSecondary,
    textMuted: ensureContrastColor(preset.tokens.textMuted ?? preset.tokens.mutedText, preset.tokens.surface, '#475569'),
    textOnDark: preset.tokens.textOnDark ?? '#ffffff',
    textOnLight: '#111827',
    textOnAccent: accentContrast,
    surfaceDark,
    surfaceGlass: preset.tokens.surfaceGlass ?? 'rgba(18,15,12,.84)',
    borderStrong: accent,
    accentSoft: withAlpha(accent, 0.18),
    accentMuted: preset.tokens.accentMuted ?? mixColor(accent, preset.tokens.surface, 0.36),
    accentContrast,
    cta: safeCta,
    ctaHover,
    ctaText: safeCtaText,
    ctaGradientFrom: preset.tokens.ctaGradientFrom ?? mixColor(safeCta, accent, 0.18),
    ctaGradientTo: preset.tokens.ctaGradientTo ?? darkenColor(safeCta, 0.12),
    ctaHoverGradientFrom: preset.tokens.ctaHoverGradientFrom ?? mixColor(safeCta, accent, 0.26),
    ctaHoverGradientTo: preset.tokens.ctaHoverGradientTo ?? ctaHover,
    ctaBorder: preset.tokens.ctaBorder ?? withAlpha(accent, 0.48),
    ctaShadow: preset.tokens.ctaShadow ?? `0 16px 36px ${withAlpha(safeCta, 0.28)}, inset 0 1px 0 ${withAlpha('#ffffff', 0.16)}`,
    ctaInnerHighlight: preset.tokens.ctaInnerHighlight ?? withAlpha('#ffffff', 0.18),
    secondaryCta: preset.tokens.secondaryCta ?? preset.tokens.surface,
    secondaryCtaText: preset.tokens.secondaryCtaText ?? getReadableTextColor(preset.tokens.surface),
    secondaryCtaGradientFrom: preset.tokens.secondaryCtaGradientFrom ?? mixColor(preset.tokens.surface, accent, 0.08),
    secondaryCtaGradientTo: preset.tokens.secondaryCtaGradientTo ?? mixColor(preset.tokens.surface, surfaceDark, 0.05),
    secondaryCtaBorder: preset.tokens.secondaryCtaBorder ?? withAlpha(accent, 0.34),
    secondaryCtaShadow: preset.tokens.secondaryCtaShadow ?? `0 12px 28px rgba(20,15,11,.12), inset 0 1px 0 ${withAlpha('#ffffff', 0.5)}`,
    buttonPrimary: safeCta,
    buttonPrimaryText: safeCtaText,
    buttonSecondary: preset.tokens.surface,
    buttonSecondaryText: getReadableTextColor(preset.tokens.surface),
    heroScrim: 'linear-gradient(90deg,rgba(8,6,5,.84),rgba(8,6,5,.60),rgba(8,6,5,.34))',
    heroText: preset.tokens.heroText ?? preset.tokens.textOnDark ?? '#ffffff',
    heroMutedText: preset.tokens.heroMutedText ?? 'rgba(255,248,234,.90)',
    heroCardBackground: preset.tokens.heroCardBackground ?? 'rgba(20,15,11,.88)',
    heroCardText: preset.tokens.heroCardText ?? preset.tokens.textOnDark ?? '#ffffff',
    surfaceDarkGradientFrom,
    surfaceDarkGradientTo,
    surfaceDarkBorder: preset.tokens.surfaceDarkBorder ?? withAlpha(accent, 0.26),
    surfaceDarkShadow: preset.tokens.surfaceDarkShadow ?? '0 28px 80px rgba(0,0,0,.32)',
    footerGradientFrom: preset.tokens.footerGradientFrom ?? surfaceDarkGradientFrom,
    footerGradientTo: preset.tokens.footerGradientTo ?? darkenColor(surfaceDark, 0.22),
    footerTopBorder: preset.tokens.footerTopBorder ?? withAlpha(accent, 0.3),
    modalBackground: preset.tokens.modalBackground ?? surfaceDark,
    modalSurface,
    modalSurfaceGradientFrom: preset.tokens.modalSurfaceGradientFrom ?? mixColor(modalSurface, accent, 0.08),
    modalSurfaceGradientTo: preset.tokens.modalSurfaceGradientTo ?? modalSurface,
    modalSurfaceBorder: preset.tokens.modalSurfaceBorder ?? withAlpha(accent, 0.24),
    modalText: preset.tokens.modalText ?? preset.tokens.textOnDark ?? '#ffffff',
    modalMutedText: preset.tokens.modalMutedText ?? 'rgba(255,248,234,.74)',
    modalBorder: preset.tokens.modalBorder ?? withAlpha(accent, 0.28),
    priceText: preset.tokens.priceText ?? safeCta,
    badgeBackground: preset.tokens.badgeBackground ?? withAlpha(accent, 0.22),
    badgeText: preset.tokens.badgeText ?? textPrimary,
    cardOverlay: 'rgba(255,255,255,.95)',
    cardOverlayText: '#111827',
  };
}

export function premiumTokenStyles(tokens: PremiumColorTokens): CSSProperties {
  return {
    '--premium-primary': tokens.primary,
    '--premium-accent': tokens.accent,
    '--premium-background': tokens.background,
    '--premium-background-alt': tokens.backgroundAlt,
    '--premium-surface': tokens.surface,
    '--premium-surface-muted': tokens.surfaceMuted,
    '--premium-text': tokens.text,
    '--premium-muted': tokens.mutedText,
    '--premium-border': tokens.border,
    '--premium-heading': tokens.heading,
    '--premium-eyebrow': tokens.eyebrow,
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
    '--premium-accent-muted': tokens.accentMuted,
    '--premium-accent-contrast': tokens.accentContrast,
    '--premium-cta': tokens.cta,
    '--premium-cta-hover': tokens.ctaHover,
    '--premium-cta-text': tokens.ctaText,
    '--premium-cta-gradient-from': tokens.ctaGradientFrom,
    '--premium-cta-gradient-to': tokens.ctaGradientTo,
    '--premium-cta-hover-gradient-from': tokens.ctaHoverGradientFrom,
    '--premium-cta-hover-gradient-to': tokens.ctaHoverGradientTo,
    '--premium-cta-border': tokens.ctaBorder,
    '--premium-cta-shadow': tokens.ctaShadow,
    '--premium-cta-inner-highlight': tokens.ctaInnerHighlight,
    '--premium-secondary-cta': tokens.secondaryCta,
    '--premium-secondary-cta-text': tokens.secondaryCtaText,
    '--premium-secondary-cta-gradient-from': tokens.secondaryCtaGradientFrom,
    '--premium-secondary-cta-gradient-to': tokens.secondaryCtaGradientTo,
    '--premium-secondary-cta-border': tokens.secondaryCtaBorder,
    '--premium-secondary-cta-shadow': tokens.secondaryCtaShadow,
    '--premium-button-primary': tokens.buttonPrimary,
    '--premium-button-primary-text': tokens.buttonPrimaryText,
    '--premium-button-secondary': tokens.buttonSecondary,
    '--premium-button-secondary-text': tokens.buttonSecondaryText,
    '--premium-hero-overlay': tokens.heroOverlay,
    '--premium-hero-scrim': tokens.heroScrim,
    '--premium-hero-text': tokens.heroText,
    '--premium-hero-muted-text': tokens.heroMutedText,
    '--premium-hero-card-background': tokens.heroCardBackground,
    '--premium-hero-card-text': tokens.heroCardText,
    '--premium-surface-dark-gradient-from': tokens.surfaceDarkGradientFrom,
    '--premium-surface-dark-gradient-to': tokens.surfaceDarkGradientTo,
    '--premium-surface-dark-border': tokens.surfaceDarkBorder,
    '--premium-surface-dark-shadow': tokens.surfaceDarkShadow,
    '--premium-footer-gradient-from': tokens.footerGradientFrom,
    '--premium-footer-gradient-to': tokens.footerGradientTo,
    '--premium-footer-top-border': tokens.footerTopBorder,
    '--premium-modal-background': tokens.modalBackground,
    '--premium-modal-surface': tokens.modalSurface,
    '--premium-modal-surface-gradient-from': tokens.modalSurfaceGradientFrom,
    '--premium-modal-surface-gradient-to': tokens.modalSurfaceGradientTo,
    '--premium-modal-surface-border': tokens.modalSurfaceBorder,
    '--premium-modal-text': tokens.modalText,
    '--premium-modal-muted-text': tokens.modalMutedText,
    '--premium-modal-border': tokens.modalBorder,
    '--premium-price-text': tokens.priceText,
    '--premium-badge-background': tokens.badgeBackground,
    '--premium-badge-text': tokens.badgeText,
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
  const cta = ensureCtaColor(tokens.buttonPrimary, tokens.buttonPrimary);
  const ctaText = tokens.buttonPrimaryText ?? getReadableTextColor(cta);
  const surfaceDark = tokens.surfaceDark ?? tokens.primary;
  const ctaHover = tokens.ctaHover ?? darkenColor(cta, 0.2);
  const modalSurface = tokens.modalSurface ?? mixColor(surfaceDark, '#ffffff', 0.08);
  return {
    ...tokens,
    backgroundAlt: tokens.backgroundAlt ?? tokens.background,
    text: textPrimary,
    mutedText: textSecondary,
    heading: tokens.heading ?? textPrimary,
    eyebrow: tokens.eyebrow ?? tokens.primary,
    textPrimary,
    textSecondary,
    textMuted,
    textOnDark: tokens.textOnDark ?? '#ffffff',
    textOnLight: tokens.textOnLight ?? '#111827',
    textOnAccent: tokens.textOnAccent ?? getReadableTextColor(tokens.accent),
    surfacePrimary: tokens.surfacePrimary ?? tokens.background,
    surfaceSecondary: tokens.surfaceSecondary ?? tokens.surface,
    surfaceElevated: tokens.surfaceElevated ?? '#ffffff',
    surfaceMuted: tokens.surfaceMuted ?? tokens.surfaceElevated ?? tokens.surface,
    surfaceDark,
    surfaceGlass: tokens.surfaceGlass ?? 'rgba(18,15,12,.86)',
    borderSubtle: tokens.borderSubtle ?? tokens.border,
    borderStrong: tokens.borderStrong ?? tokens.accent,
    accentSoft: tokens.accentSoft ?? withAlpha(tokens.accent, 0.18),
    accentMuted: tokens.accentMuted ?? mixColor(tokens.accent, tokens.surface, 0.36),
    accentContrast: tokens.accentContrast ?? getReadableTextColor(tokens.accent),
    cta,
    ctaHover,
    ctaText,
    ctaGradientFrom: tokens.ctaGradientFrom ?? mixColor(cta, tokens.accent, 0.18),
    ctaGradientTo: tokens.ctaGradientTo ?? darkenColor(cta, 0.12),
    ctaHoverGradientFrom: tokens.ctaHoverGradientFrom ?? mixColor(cta, tokens.accent, 0.26),
    ctaHoverGradientTo: tokens.ctaHoverGradientTo ?? ctaHover,
    ctaBorder: tokens.ctaBorder ?? withAlpha(tokens.accent, 0.48),
    ctaShadow: tokens.ctaShadow ?? `0 16px 36px ${withAlpha(cta, 0.28)}, inset 0 1px 0 ${withAlpha('#ffffff', 0.16)}`,
    ctaInnerHighlight: tokens.ctaInnerHighlight ?? withAlpha('#ffffff', 0.18),
    secondaryCta: tokens.secondaryCta ?? tokens.buttonSecondary,
    secondaryCtaText: tokens.secondaryCtaText ?? tokens.buttonSecondaryText,
    secondaryCtaGradientFrom: tokens.secondaryCtaGradientFrom ?? mixColor(tokens.buttonSecondary, tokens.accent, 0.08),
    secondaryCtaGradientTo: tokens.secondaryCtaGradientTo ?? mixColor(tokens.buttonSecondary, surfaceDark, 0.05),
    secondaryCtaBorder: tokens.secondaryCtaBorder ?? withAlpha(tokens.accent, 0.34),
    secondaryCtaShadow: tokens.secondaryCtaShadow ?? `0 12px 28px rgba(20,15,11,.12), inset 0 1px 0 ${withAlpha('#ffffff', 0.5)}`,
    buttonPrimary: cta,
    buttonPrimaryText: ctaText,
    heroScrim: tokens.heroScrim ?? 'linear-gradient(90deg,rgba(8,6,5,.84),rgba(8,6,5,.60),rgba(8,6,5,.34))',
    heroText: tokens.heroText ?? tokens.textOnDark ?? '#ffffff',
    heroMutedText: tokens.heroMutedText ?? 'rgba(255,248,234,.90)',
    heroCardBackground: tokens.heroCardBackground ?? 'rgba(20,15,11,.88)',
    heroCardText: tokens.heroCardText ?? tokens.textOnDark ?? '#ffffff',
    surfaceDarkGradientFrom: tokens.surfaceDarkGradientFrom ?? mixColor(surfaceDark, tokens.accent, 0.12),
    surfaceDarkGradientTo: tokens.surfaceDarkGradientTo ?? darkenColor(surfaceDark, 0.14),
    surfaceDarkBorder: tokens.surfaceDarkBorder ?? withAlpha(tokens.accent, 0.26),
    surfaceDarkShadow: tokens.surfaceDarkShadow ?? '0 28px 80px rgba(0,0,0,.32)',
    footerGradientFrom: tokens.footerGradientFrom ?? mixColor(surfaceDark, tokens.accent, 0.12),
    footerGradientTo: tokens.footerGradientTo ?? darkenColor(surfaceDark, 0.22),
    footerTopBorder: tokens.footerTopBorder ?? withAlpha(tokens.accent, 0.3),
    modalBackground: tokens.modalBackground ?? surfaceDark,
    modalSurface,
    modalSurfaceGradientFrom: tokens.modalSurfaceGradientFrom ?? mixColor(modalSurface, tokens.accent, 0.08),
    modalSurfaceGradientTo: tokens.modalSurfaceGradientTo ?? modalSurface,
    modalSurfaceBorder: tokens.modalSurfaceBorder ?? withAlpha(tokens.accent, 0.24),
    modalText: tokens.modalText ?? tokens.textOnDark ?? '#ffffff',
    modalMutedText: tokens.modalMutedText ?? 'rgba(255,248,234,.74)',
    modalBorder: tokens.modalBorder ?? withAlpha(tokens.accent, 0.28),
    priceText: tokens.priceText ?? cta,
    badgeBackground: tokens.badgeBackground ?? withAlpha(tokens.accent, 0.22),
    badgeText: tokens.badgeText ?? textPrimary,
    cardOverlay: tokens.cardOverlay ?? 'rgba(255,255,255,.94)',
    cardOverlayText: tokens.cardOverlayText ?? '#111827',
  };
}

function ensureCtaColor(candidate: string | null | undefined, fallback: string) {
  const color = normalizeHexColor(candidate, fallback);
  return isLightColor(color) ? darkenColor(color, 0.44) : color;
}

export function darkenColor(hex: string, amount: number) {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = Math.max(0, Math.round(parseInt(normalized.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(normalized.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(normalized.slice(4, 6), 16) * (1 - amount)));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixColor(hex: string, targetHex: string, amount: number) {
  const source = normalizeHexColor(hex).slice(1);
  const target = normalizeHexColor(targetHex).slice(1);
  const r = Math.round(parseInt(source.slice(0, 2), 16) * (1 - amount) + parseInt(target.slice(0, 2), 16) * amount);
  const g = Math.round(parseInt(source.slice(2, 4), 16) * (1 - amount) + parseInt(target.slice(2, 4), 16) * amount);
  const b = Math.round(parseInt(source.slice(4, 6), 16) * (1 - amount) + parseInt(target.slice(4, 6), 16) * amount);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0');
}

function withAlpha(hex: string, alpha: number) {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const fallbackPremiumTokens: PremiumColorTokens = {
  primary: '#6B3F24',
  accent: '#B88746',
  background: '#F7F0E6',
  backgroundAlt: '#FFF8EF',
  surface: '#FFF9F0',
  surfaceElevated: '#FDF3E6',
  surfaceDark: '#211A14',
  text: '#1E1712',
  mutedText: '#5A4A3D',
  border: '#D8C2A3',
  textPrimary: '#1E1712',
  textSecondary: '#5A4A3D',
  textMuted: '#7A6A5A',
  textOnDark: '#FFF7EA',
  textOnLight: '#111827',
  textOnAccent: '#111827',
  surfacePrimary: '#F7F0E6',
  surfaceSecondary: '#FFF9F0',
  surfaceMuted: '#FDF3E6',
  surfaceGlass: 'rgba(20,15,11,.88)',
  borderSubtle: '#D8C2A3',
  borderStrong: '#B88746',
  accentSoft: '#E9D3B0',
  accentMuted: '#D8BE98',
  accentContrast: '#111827',
  cta: '#6B3F24',
  ctaHover: '#4F2D19',
  ctaText: '#FFF8EF',
  ctaGradientFrom: '#765034',
  ctaGradientTo: '#5A321D',
  ctaHoverGradientFrom: '#815A3A',
  ctaHoverGradientTo: '#4F2D19',
  ctaBorder: 'rgba(184,135,70,.48)',
  ctaShadow: '0 16px 36px rgba(107,63,36,.28), inset 0 1px 0 rgba(255,255,255,.16)',
  ctaInnerHighlight: 'rgba(255,255,255,.18)',
  secondaryCta: '#FFF9F0',
  secondaryCtaText: '#1E1712',
  secondaryCtaGradientFrom: '#FFF9F0',
  secondaryCtaGradientTo: '#F4E8D8',
  secondaryCtaBorder: 'rgba(184,135,70,.34)',
  secondaryCtaShadow: '0 12px 28px rgba(20,15,11,.12), inset 0 1px 0 rgba(255,255,255,.5)',
  buttonPrimary: '#6B3F24',
  buttonPrimaryText: '#FFF8EF',
  buttonSecondary: '#FFF9F0',
  buttonSecondaryText: '#1E1712',
  heroOverlay: 'linear-gradient(90deg,rgba(22,16,11,.94),rgba(33,26,20,.74),rgba(33,26,20,.32))',
  heroScrim: 'linear-gradient(90deg,rgba(8,6,5,.84),rgba(8,6,5,.60),rgba(8,6,5,.34))',
  heroText: '#FFF7EA',
  heroMutedText: 'rgba(255,248,234,.90)',
  heroCardBackground: 'rgba(20,15,11,.88)',
  heroCardText: '#FFF7EA',
  surfaceDarkGradientFrom: '#35281E',
  surfaceDarkGradientTo: '#18120E',
  surfaceDarkBorder: 'rgba(184,135,70,.26)',
  surfaceDarkShadow: '0 28px 80px rgba(0,0,0,.32)',
  footerGradientFrom: '#35281E',
  footerGradientTo: '#17110D',
  footerTopBorder: 'rgba(184,135,70,.3)',
  modalBackground: '#211A14',
  modalSurface: '#35281F',
  modalSurfaceGradientFrom: '#463526',
  modalSurfaceGradientTo: '#35281F',
  modalSurfaceBorder: 'rgba(184,135,70,.24)',
  modalText: '#FFF7EA',
  modalMutedText: 'rgba(255,248,234,.74)',
  modalBorder: 'rgba(184,135,70,.28)',
  priceText: '#6B3F24',
  badgeBackground: 'rgba(184,135,70,.22)',
  badgeText: '#1E1712',
  cardOverlay: 'rgba(255,255,255,.94)',
  cardOverlayText: '#111827',
};
