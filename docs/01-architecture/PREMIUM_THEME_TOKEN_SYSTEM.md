# Premium Theme Token System

Last updated: 2026-06-27

## Purpose

Stage 9.8C introduces a premium theme token layer for `restaurant_premium` and `cafe_premium`.

The system separates:

- Template = layout and experience.
- Brand = color, logo, content, and images.
- Business Type = recommendation.
- Template = user choice.
- Brand Color = user customization.

## Scope

Included:

- Restaurant Premium color presets.
- Cafe Premium color presets.
- Custom primary color.
- Custom accent color.
- Token-based premium CSS variables.
- Adaptive Signature and Gallery density in premium renderers.

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

## Migration Decision

No Prisma migration is required for Stage 9.8C.

Reason:

- Theme already has `primaryColor`, `secondaryColor`, and `accentColor`.
- Theme already has a JSON `typography` field that can safely store `premiumColorPreset`.
- The feature does not require a new table, enum, relation, entitlement, or billing object.
