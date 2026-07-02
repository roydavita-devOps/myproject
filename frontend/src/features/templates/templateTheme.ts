import { CSSProperties } from 'react';
import { Website } from '../../types/api';
import { premiumTokenStyles, resolvePremiumColorTokens, resolvePremiumVariant } from './premiumTheme';

export const templateTypography = {
  display: 'tpl-display',
  h1: 'tpl-h1',
  h2: 'tpl-h2',
  h3: 'tpl-h3',
  body: 'tpl-body',
  caption: 'tpl-caption',
  small: 'tpl-small',
};

export const templateSpacing = {
  xs: 'var(--tpl-space-xs)',
  sm: 'var(--tpl-space-sm)',
  md: 'var(--tpl-space-md)',
  lg: 'var(--tpl-space-lg)',
  xl: 'var(--tpl-space-xl)',
  '2xl': 'var(--tpl-space-2xl)',
  '3xl': 'var(--tpl-space-3xl)',
};

export function resolveTemplateTheme(website: Website): CSSProperties {
  const baseTheme = {
    '--tenant-primary': website.theme?.primaryColor ?? '#0f766e',
    '--tenant-secondary': website.theme?.secondaryColor ?? '#f59e0b',
    '--tenant-accent': website.theme?.accentColor ?? '#2563eb',
    '--tenant-font-heading': website.theme?.typography?.heading ?? 'Inter',
    '--tenant-font-body': website.theme?.typography?.body ?? 'Inter',
    '--tpl-primary': website.theme?.primaryColor ?? '#0f766e',
    '--tpl-secondary': website.theme?.secondaryColor ?? '#f59e0b',
    '--tpl-accent': website.theme?.accentColor ?? '#2563eb',
  } as CSSProperties;

  if (!resolvePremiumVariant(website)) return baseTheme;

  const premiumTokens = resolvePremiumColorTokens(website);
  return {
    ...baseTheme,
    '--tpl-primary': premiumTokens.cta ?? premiumTokens.buttonPrimary,
    '--tpl-secondary': premiumTokens.accent,
    '--tpl-accent': premiumTokens.accent,
    '--tpl-background': premiumTokens.background,
    '--tpl-surface': premiumTokens.surface,
    '--tpl-border': premiumTokens.border,
    '--tpl-text-primary': premiumTokens.text,
    '--tpl-text-secondary': premiumTokens.mutedText,
    ...premiumTokenStyles(premiumTokens),
  } as CSSProperties;
}
