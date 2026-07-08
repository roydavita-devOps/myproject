# Premium Theme Token System

Last updated: 2026-07-08

## Purpose

Stage 9.8C introduced a premium theme token layer for `restaurant_premium` and `cafe_premium`.

Stage 9.8D strengthens the token layer with semantic contrast protection.

The Restaurant Premium editorial refinement also adds renderer-local typography variables for restaurant presentation without changing the shared theme schema.

Stage 9.8D-R6 refines Restaurant Premium into the first Premium Experience Foundation reference for semantic color behavior.

Stage 9.8D-R8 adds a Restaurant Premium depth token layer for subtle CTA, dark surface, footer, and modal tab polish.

Stage 9.8E locks Restaurant Premium as the first approved Premium Foundation Reference. The token system, semantic contrast rules, depth treatment, hero scrim behavior, and reduced-motion expectations are reusable standards for future premium templates, but `RestaurantPremiumTemplate` is not a parent component that other premium templates should inherit blindly.

Stage 9.9 applies the foundation to Cafe Premium with cafe-specific presets, warm modal treatment, CTA depth, compact mobile hero behavior, and business-specific menu modal labels.

Stage 9.9A refines Cafe Premium warm accent usage for placeholders, modal detail states, price chips, focus rings, and gallery fallback visuals without changing the shared token API or Restaurant Premium branch behavior.

Stage 9.9B confirms Premium Hero Display as a premium template capability for Restaurant Premium and Cafe Premium through existing `Theme.heroMedia`.

Stage 9.9C locks Cafe Premium as the second approved Premium Template. Cafe Premium proves foundation reuse without cloning Restaurant Premium layout or restaurant-specific language.

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
- Restaurant Premium renderer-local typography variables for heading, body, eyebrow, hero title, section title, line height, letter spacing, and font weights.
- Restaurant Premium semantic color tokens for image-safe hero overlays, CTA contrast, modal alignment, price text, and badge treatment.
- Restaurant Premium depth tokens for CTA gradients, button borders, button shadows, dark surface gradients, footer gradients, and modal surface gradients.
- Cafe Premium warm placeholder and modal accent usage for missing image states, cafe-specific price chips, focus rings, detail labels, and gallery fallback visuals.
- Premium Hero Display reuse for Restaurant Premium and Cafe Premium through existing `Theme.heroMedia`.

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
- `--premium-cta`
- `--premium-cta-hover`
- `--premium-cta-text`
- `--premium-cta-gradient-from`
- `--premium-cta-gradient-to`
- `--premium-cta-hover-gradient-from`
- `--premium-cta-hover-gradient-to`
- `--premium-cta-border`
- `--premium-cta-shadow`
- `--premium-cta-inner-highlight`
- `--premium-secondary-cta`
- `--premium-secondary-cta-text`
- `--premium-secondary-cta-gradient-from`
- `--premium-secondary-cta-gradient-to`
- `--premium-secondary-cta-border`
- `--premium-secondary-cta-shadow`
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
- `--premium-accent-muted`
- `--premium-accent-contrast`
- `--premium-hero-scrim`
- `--premium-hero-text`
- `--premium-hero-muted-text`
- `--premium-hero-card-background`
- `--premium-hero-card-text`
- `--premium-surface-dark-gradient-from`
- `--premium-surface-dark-gradient-to`
- `--premium-surface-dark-border`
- `--premium-surface-dark-shadow`
- `--premium-footer-gradient-from`
- `--premium-footer-gradient-to`
- `--premium-footer-top-border`
- `--premium-modal-background`
- `--premium-modal-surface`
- `--premium-modal-surface-gradient-from`
- `--premium-modal-surface-gradient-to`
- `--premium-modal-surface-border`
- `--premium-modal-text`
- `--premium-modal-muted-text`
- `--premium-modal-border`
- `--premium-price-text`
- `--premium-badge-background`
- `--premium-badge-text`
- `--premium-card-overlay`
- `--premium-card-overlay-text`

Restaurant Premium presets:

- `editorial_umber` (default)
- `charcoal_gold`
- `olive_cream`
- `burgundy_linen`
- `espresso_copper`

Cafe Premium presets:

- `roasted_cream` (default)
- `espresso_linen`
- `matcha_cream`
- `caramel_noir`
- `terracotta_milk`

Restaurant Premium also defines local renderer variables:

- `--restaurant-heading-font`
- `--restaurant-body-font`
- `--restaurant-eyebrow-font`
- `--restaurant-hero-title-size`
- `--restaurant-section-title-size`
- `--restaurant-body-text-size`
- `--restaurant-line-height`
- `--restaurant-letter-spacing`
- `--restaurant-heading-weight`
- `--restaurant-body-weight`

These variables are scoped inside `RestaurantPremiumTemplate.tsx` and do not change the shared theme API.

## Contrast Guard

Stage 9.8D adds small utility functions in `premiumTheme.ts`:

- `normalizeHexColor()`
- `isLightColor()`
- `getReadableTextColor()`
- `ensureContrastColor()`
- `darkenColor()`
- `mixColor()`

These utilities prevent invalid custom colors and avoid low-contrast text pairings.

Design rule:

- Brand color = identity, CTA, badge, icon, border, highlight.
- Semantic UI color = body text, card text, hero support text, reservation/contact details.
- Custom brand colors are guarded before becoming CTA colors; very light brand colors are darkened for active, readable CTAs.
- Hero headline and support text use near-white hero tokens plus overlay/scrim protection instead of relying on raw uploaded image contrast.

## Migration Decision

No Prisma migration is required for Stage 9.8C.
No Prisma migration is required for Stage 9.8D editorial refinement.
No Prisma migration is required for Stage 9.8D-R6 color system remediation.
No Prisma migration is required for Stage 9.8D-R8 button and surface depth polish.
No Prisma migration is required for Stage 9.8E foundation lock.
No Prisma migration is required for Stage 9.9 Cafe Premium redesign.
No Prisma migration is required for Stage 9.9A Cafe Premium warm accent and placeholder polish.
No Prisma migration is required for Stage 9.9B Cafe Premium Hero Display controls.
No Prisma migration is required for Stage 9.9C Cafe Premium template lock.

Reason:

- Theme already has `primaryColor`, `secondaryColor`, and `accentColor`.
- Theme already has a JSON `typography` field that can safely store `premiumColorPreset`.
- The feature does not require a new table, enum, relation, entitlement, or billing object.

## Stage 9.8E Foundation Token Guidance

Reusable for future premium templates:

- Semantic premium color tokens for readable headings, body copy, cards, modal text, price chips, badges, and CTAs.
- Warm accent systems when they match the business category.
- CTA depth treatment using subtle gradients, border, controlled shadow, and hover lift.
- Footer and dark surface depth treatment.
- Image-safe hero overlay and scrim behavior.
- Reduced-motion fallback when premium templates use controlled motion.
- Premium placeholder behavior when tenant images are missing.

Not reusable without adaptation:

- Restaurant-specific copy, reservation-first assumptions, Signature Dishes language, and restaurant menu hierarchy.
- Restaurant Premium layout structure as a hardcoded parent for other premium templates.
- Restaurant-specific ambience or gallery tone.

Future premium templates must use this system as a quality reference while preserving their own business-specific experience.

Stage 9.9 Cafe Premium usage:

- Cafe Premium uses warm coffee, cream, caramel, soft matcha, terracotta, espresso, linen, and milk-foam directions.
- Cafe Premium modal treatment reuses premium modal tokens with cafe-specific labels.
- Cafe Premium does not use Restaurant Premium preset names, restaurant-specific copy, or reservation-first assumptions.

Stage 9.9C Cafe Premium lock guidance:

- Cafe Premium is the second approved Premium Template, not a replacement foundation.
- Cafe Premium-specific coffee, pastry, ambience/corner, morning ritual, and cafe visit language is not reusable without adaptation.
- Future premium templates may reuse semantic tokens, Hero Display capability, Premium Full Menu modal patterns, item detail browsing, placeholder standards, formatted prices/opening hours, and CTA hierarchy.
- Future premium templates must keep their own business-specific copy, mood, and section rhythm.
