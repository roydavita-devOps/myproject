# PHASE 9.8D - Restaurant Premium Editorial Redesign Report

Date: 2026-06-28

## Executive Summary

Restaurant Premium was refined into a more commercially sellable restaurant experience. The work focused on reservation-first CTA language, editorial restaurant typography, stronger Signature Dishes hierarchy, reduced repeated contact CTAs, and clearer customer-facing section flow.

## Scope

Included:

- Existing `restaurant_premium` renderer only.
- Header, hero, Signature Dishes, story, gallery, visit/reservation, and footer refinements.
- Source-level regression tests for Restaurant Premium CTA and typography rules.
- Screenshot evidence generation script for desktop, tablet, mobile, and readable header CTA.

Excluded:

- Cafe Premium redesign.
- New template keys.
- Template registry changes.
- Template resolver changes.
- Marketplace, catalog, billing, subscription, entitlement, or access control logic.
- Backend code, Prisma schema, or database migrations.

## Reference Usage

The reference site was used only as high-level inspiration for editorial restaurant hierarchy, reservation-led flow, and premium visual pacing. No layout, copy, asset, or implementation was copied.

## CTA Strategy Changes

The CTA hierarchy is now:

- Header: `Reserve a Table`.
- Hero primary: `Reserve a Table`.
- Hero secondary: `Explore Signature Dishes`.
- Hero tertiary: `Get Directions`.
- Signature Dishes: `Explore Full Menu`.
- Visit & Reservation: `Reserve via WhatsApp`, `Call Restaurant`, and `Get Directions` when tenant data exists.

Gallery and Footer no longer repeat generic WhatsApp CTAs.

## WhatsApp/Reservation Label Changes

Generic `Chat WhatsApp` copy was removed from Restaurant Premium. WhatsApp-backed actions are presented as restaurant-first reservation actions:

- `Reserve a Table`
- `Reserve via WhatsApp`

## Contrast & Readability Fixes

Restaurant Premium continues using the semantic premium tokens added in the prior contrast remediation:

- `--premium-text-primary`
- `--premium-text-secondary`
- `--premium-text-on-dark`
- `--premium-button-primary`
- `--premium-button-primary-text`
- `--premium-surface`
- `--premium-surface-dark`

Header CTA, hero card, Signature Dishes, story, visit/reservation, and footer copy use semantic tokens instead of raw pale accent text for body content.

## Typography Refinement

Restaurant Premium now defines renderer-local typography variables:

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

The heading stack uses a classic serif fallback, while body copy remains readable with a system sans-serif stack. No new dependency was added.

## Customer-Facing Copy Cleanup

Restaurant Premium copy now focuses on guest outcomes:

- reservation
- signature dishes
- dining atmosphere
- opening hours
- address
- visit planning

Internal product/template wording was avoided in the public renderer.

## Restaurant Premium Section Redesign

The public flow is now:

1. Cinematic Hero
2. Signature Dishes
3. Restaurant Story
4. Dining Experience
5. Ambience Gallery
6. Reviews
7. Visit & Reservation
8. Footer

## Signature Dishes Improvements

Signature Dishes is now the strongest commercial section. It includes:

- editorial section title
- dish image/fallback media
- dish name
- short description
- price
- signature badge
- full menu action

Per-card WhatsApp buttons are intentionally not rendered.

## Visit & Reservation Consolidation

Visit & Reservation now groups:

- address
- opening hours
- reservation and contact actions

This keeps conversion actions available without repeating them in Gallery and Footer.

## Mobile Review

Mobile validation target:

- no horizontal scroll
- no broken images
- no blank sections
- header CTA readable
- hero CTA visible and clickable
- Signature Dishes stacked safely
- Gallery stacked safely

Screenshot evidence is generated under `docs/evidence/restaurant-premium-editorial-redesign/`.

## Testing Results

Final local validation:

- `npm --prefix frontend run lint`: Passed.
- `npm --prefix frontend run test`: Passed, 3 test files and 38 tests.
- `npm --prefix frontend run build`: Passed with existing Vite chunk-size warning.
- `docker compose up -d --build`: Passed.
- `npm run smoke-test`: Passed, 10 tests.
- `node scripts/generate-restaurant-premium-editorial-evidence.mjs`: Passed.
- Local `/health` and `/health/ready`: Passed with HTTP 200.

Post-push validation:

- GitHub Actions, Vercel deployment, and Railway health check are validated after commit/push.

## Evidence Locations

Expected evidence paths:

- `docs/evidence/restaurant-premium-editorial-redesign/restaurant-premium-desktop.png`
- `docs/evidence/restaurant-premium-editorial-redesign/restaurant-premium-tablet.png`
- `docs/evidence/restaurant-premium-editorial-redesign/restaurant-premium-mobile.png`
- `docs/evidence/restaurant-premium-editorial-redesign/restaurant-premium-header-cta.png`
- `docs/evidence/restaurant-premium-editorial-redesign/visual-validation-results.json`

## Risks

- Serif heading rendering depends on local/system fallback fonts.
- Existing shared `TemplateSection` still controls some section heading styling outside custom editorial sections.
- Vite chunk-size warning remains informational and unchanged by this stage.

## Go/No-Go Decision

Current decision: GO for approval.

No new feature, Cafe Premium redesign, backend change, Prisma migration, billing, subscription, entitlement, marketplace, catalog, registry, or resolver change was introduced.
