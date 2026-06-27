# Premium Theme Token System

Last updated: 2026-06-27

## Purpose

Stage 9.8C introduced a premium theme token layer for `restaurant_premium` and `cafe_premium`.

Stage 9.8D strengthens the token layer with semantic contrast protection.

The system separates:

- Template = layout and experience.
- Brand = color, logo, content, and images.
- Business Type = recommendation.
- Template = user choice.
- Brand Color = user customization.
- Semantic color = readability protection.

## Scope

Included:

- Restaurant Premium color presets.
- Cafe Premium color presets.
- Custom primary color.
- Custom accent color.
- Token-based premium CSS variables.
- Adaptive Signature and Gallery density in premium renderers.
- Contrast-safe semantic text, surface, border, hero, CTA, and card overlay variables.

Excluded:

- New template keys.
- Template registry changes.
- Marketplace.
- Billing.
- Subscription enforcement.
- Entitlements.
- Prisma migration.
- Backend schema changes.

## Token Source

The frontend resolves premium tokens from:

- `website.template.schema.templateKey`
- `website.template.schema.rendererKey`
- `website.template.name`
- `website.theme.primaryColor`
- `website.theme.accentColor`
- `website.theme.typography.premiumColorPreset`

The backend persists the selected premium preset in `Theme.typography` and stores custom colors in existing Theme color fields.

## CSS Variables

Premium templates consume:

- `--premium-primary`
- `--premium-accent`
- `--premium-background`
- `--premium-surface`
- `--premium-text`
- `--premium-muted`
- `--premium-border`
- `--premium-button-primary`
- `--premium-button-primary-text`
- `--premium-button-secondary`
- `--premium-button-secondary-text`
- `--premium-hero-overlay`
- `--premium-text-primary`
- `--premium-text-secondary`
- `--premium-text-muted`
- `--premium-text-on-dark`
- `--premium-text-on-light`
- `--premium-text-on-accent`
- `--premium-surface-primary`
- `--premium-surface-secondary`
- `--premium-surface-elevated`
- `--premium-surface-dark`
- `--premium-surface-glass`
- `--premium-border-subtle`
- `--premium-border-strong`
- `--premium-accent-soft`
- `--premium-accent-contrast`
- `--premium-hero-scrim`
- `--premium-card-overlay`
- `--premium-card-overlay-text`

## Contrast Guard

Stage 9.8D adds small utility functions in `premiumTheme.ts`:

- `normalizeHexColor()`
- `isLightColor()`
- `getReadableTextColor()`
- `ensureContrastColor()`

These utilities prevent invalid custom colors and avoid low-contrast text pairings.

Design rule:

- Brand color = identity, CTA, badge, icon, border, highlight.
- Semantic UI color = body text, card text, hero support text, reservation/contact details.

## Migration Decision

No Prisma migration is required for Stage 9.8C.

Reason:

- Theme already has `primaryColor`, `secondaryColor`, and `accentColor`.
- Theme already has a JSON `typography` field that can safely store `premiumColorPreset`.
- The feature does not require a new table, enum, relation, entitlement, or billing object.
