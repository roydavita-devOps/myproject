# PHASE 9.8D-R6 - Restaurant Premium Color System Remediation Report

Date: 2026-07-02

## 1. Executive Summary

Stage 9.8D-R6 refines the Restaurant Premium color system so premium visual quality is not dependent on raw user brand colors. The implementation replaces fragile black/gold hardcoding with semantic premium tokens, sets a safer premium default preset, and aligns the hero, CTA, cards, pricing, badges, and full menu modal with the selected restaurant premium preset.

Status: GO for approval.

## 2. Scope

Implemented only Restaurant Premium color-system remediation. No new product feature was added.

Out of scope and unchanged:

- Backend code
- Prisma schema
- Database migrations
- Billing, subscription, entitlement, marketplace, or catalog logic
- Template registry keys and resolver contracts
- Restaurant Premium product structure beyond visual token usage
- Cafe Premium and other template implementations, except shared premium token plumbing

## 3. Color System Problems Found

The audit found several color risks in the previous implementation:

- Full menu modal still used fixed legacy restaurant colors such as `#f7c873`, `#120f0b`, `#17110b`, `#21170e`, `#fff7e8`, and `#1b140d`.
- Restaurant premium presets were still generic and did not clearly define the intended premium editorial direction.
- Custom brand primary colors could influence dark surfaces and CTA color too directly.
- Light or weak brand colors could produce low CTA contrast.
- Some hero, card, price, badge, and modal colors were not explicitly semantic, making future premium templates harder to parent from Restaurant Premium safely.

## 4. New Default Preset Decision

Restaurant Premium now defaults to `editorial_umber`.

Reason:

- It gives a warmer editorial restaurant feel than generic black/gold.
- It preserves premium contrast without making the whole template look overly dark.
- It provides a stable parent direction for future premium restaurant-derived templates.

## 5. Presets Added / Refined

Restaurant Premium presets are now:

- `editorial_umber`
- `charcoal_gold`
- `olive_cream`
- `burgundy_linen`
- `espresso_copper`

Each preset defines semantic tokens for page background, alternate background, surfaces, muted surfaces, dark surfaces, text, heading, muted text, eyebrow, accent, CTA, secondary CTA, hero text, hero overlay, modal colors, price color, and badges.

## 6. Semantic Token Changes

Added or expanded premium semantic tokens in `premiumTheme.ts` and CSS variable output:

- `backgroundAlt`
- `surfaceMuted`
- `heading`
- `eyebrow`
- `accentMuted`
- `cta`
- `ctaHover`
- `ctaText`
- `secondaryCta`
- `secondaryCtaText`
- `heroText`
- `heroMutedText`
- `heroCardBackground`
- `heroCardText`
- `modalBackground`
- `modalSurface`
- `modalText`
- `modalMutedText`
- `modalBorder`
- `priceText`
- `badgeBackground`
- `badgeText`

Premium templates now map `--tpl-primary` to the safe premium CTA token instead of exposing raw brand primary directly as the button color.

## 7. Hero Image-Safe Overlay Changes

Restaurant Premium keeps a stronger image-safe hero treatment:

- Hero text uses `--premium-hero-text`.
- Hero supporting copy uses `--premium-hero-muted-text`.
- Hero card uses `--premium-hero-card-background` and `--premium-hero-card-text`.
- Bright, dark, and busy uploaded image scenarios were captured as screenshot evidence.

## 8. CTA Contrast Fixes

CTA styling now uses semantic CTA tokens:

- `--premium-cta`
- `--premium-cta-hover`
- `--premium-cta-text`
- `--premium-secondary-cta`
- `--premium-secondary-cta-text`

Custom light brand colors are guarded before being allowed to become CTA colors. This prevents bright custom brand colors from creating unreadable CTA states.

## 9. Card and Section Color Fixes

Restaurant Premium card and section treatments now rely on semantic tokens:

- Signature cards use preset-aware price and badge colors.
- Reservation and footer areas use premium surface and modal semantic colors.
- Dark fallback panels no longer depend on legacy fixed black values.

## 10. Full Menu Modal Color Alignment

`PremiumFullMenuModal.tsx` now uses premium modal semantic variables for Restaurant Premium:

- `--premium-modal-background`
- `--premium-modal-surface`
- `--premium-modal-text`
- `--premium-modal-muted-text`
- `--premium-modal-border`
- `--premium-price-text`
- `--premium-badge-background`
- `--premium-badge-text`

The modal no longer contains the old hardcoded restaurant black/gold color set.

## 11. Custom Color Guard

The custom color path preserves brand identity while reducing readability risk:

- Custom `primaryColor` and `accentColor` remain available as identity/accent inputs.
- Raw light custom primary colors are not used directly for CTA.
- `ensureCtaColor`, `darkenColor`, and `mixColor` derive safer colors for contrast-sensitive UI.
- Brand color is not used directly as body text or hero text.

## 12. Testing Results

Passed:

- `npm --prefix frontend run test -- premiumTheme.test.ts premiumTemplateSource.test.ts`
  - 20 tests passed
- `npm --prefix frontend run lint`
  - Passed
- `npm --prefix frontend run test`
  - 45 tests passed
- `npm --prefix frontend run build`
  - Passed
  - Vite reported only the existing large chunk warning
- `docker compose up -d --build`
  - Passed
- `Invoke-WebRequest http://127.0.0.1/health/ready`
  - HTTP 200
- `npm run smoke-test`
  - 10 tests passed

## 13. Evidence Locations

Evidence folder:

`docs/evidence/restaurant-premium-color-system-r6/`

Generated screenshots:

- `restaurant-premium-editorial-umber-desktop.png`
- `restaurant-premium-charcoal-gold-desktop.png`
- `restaurant-premium-olive-cream-desktop.png`
- `restaurant-premium-burgundy-linen-desktop.png`
- `restaurant-premium-espresso-copper-desktop.png`
- `restaurant-premium-bright-image-hero.png`
- `restaurant-premium-dark-image-hero.png`
- `restaurant-premium-busy-image-hero.png`
- `restaurant-premium-mobile.png`
- `restaurant-premium-full-menu-modal.png`

The screenshot generation used route-based Playwright data and did not mutate the database.

## 14. Remaining Risks

- Visual approval is still required by product owner because color preference is partly subjective.
- Future premium templates should inherit semantic token intent instead of copying fixed colors.
- If users choose extremely unusual custom color combinations later, additional per-field contrast checks may still be useful.

## 15. Go / No-Go Decision

Decision: GO.

Reason:

- Restaurant Premium now has a safer premium default color direction.
- CTA, hero, modal, price, and badge colors use semantic tokens.
- Bright, dark, and busy hero image scenarios have screenshot evidence.
- Full local validation, production build, Docker readiness check, and smoke tests passed.
- No backend, database, Prisma, billing, subscription, entitlement, marketplace, or registry changes were introduced.
