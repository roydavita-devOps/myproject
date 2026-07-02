# PHASE 9.8D-R8 - Restaurant Premium Button and Surface Depth Polish Report

Date: 2026-07-02

## 1. Executive Summary

Stage 9.8D-R8 polishes Restaurant Premium CTA buttons, dark surfaces, Visit & Reservation action hierarchy, footer surface, and full menu modal tabs. The work adds subtle premium depth through tokenized gradients, warm borders, controlled shadows, and light hover lift without redesigning the template layout.

Status: GO for approval.

## 2. Scope

Implemented frontend visual polish only for `restaurant_premium`.

Out of scope and unchanged:

- Backend code
- Prisma schema
- Database migrations
- Template registry and template selection
- Payment, subscription, entitlement, marketplace, or hosting logic
- Cafe Premium redesign
- New templates
- Image pipeline or storage adapter changes

## 3. Button / Surface Problems Found

Audit findings:

- Header `Reserve a Table` used a solid CTA background and felt generic.
- Hero actions were readable but lacked premium surface depth.
- Visit & Reservation actions did not have enough hierarchy between primary reservation, call, and directions.
- Visit & Reservation dark card and footer read as flat dark blocks.
- Restaurant Full Menu modal category tabs used flat active/inactive states.

## 4. Premium Depth Token Changes

Added backward-compatible depth tokens in `premiumTheme.ts`:

- CTA gradient, hover gradient, border, shadow, and inner highlight tokens.
- Secondary CTA gradient, border, and shadow tokens.
- Dark surface gradient, border, and shadow tokens.
- Footer gradient and top border tokens.
- Modal surface gradient and border tokens.

Existing tokens such as `cta`, `ctaHover`, `ctaText`, `secondaryCta`, and `secondaryCtaText` remain available.

## 5. Header CTA Polish

Header `Reserve a Table` now uses:

- Subtle vertical warm gradient.
- Thin warm border.
- Controlled premium shadow.
- Hover lift and slightly richer hover gradient.
- Existing readable `ctaText` foreground.

## 6. Hero CTA Polish

Hero actions now use the Restaurant Premium local action renderer:

- `Explore Signature Dishes` uses a dark glass/warm bordered treatment over hero imagery.
- `Get Directions` uses an outline/glass treatment that stays visible over bright, dark, and busy hero images.
- Hero action labels remain readable and clickable.

## 7. Visit & Reservation Button Hierarchy

Visit & Reservation action hierarchy:

- `Reserve via WhatsApp` = primary premium gradient button.
- `Call Restaurant` = light premium secondary button.
- `Get Directions` = tertiary glass/outline button.

The buttons no longer look equally heavy or disabled.

## 8. Footer Surface Polish

Footer now uses:

- Subtle dark gradient.
- Warm top border.
- Inset highlight.
- Existing readable text tokens.

This keeps the footer quiet while avoiding a flat dark rectangle.

## 9. Full Menu Modal Polish

Restaurant modal updates:

- Modal shell uses a darker layered gradient and controlled shadow.
- Category tab bar uses modal surface gradient.
- Active category tab uses premium CTA gradient and shadow.
- Inactive tabs remain readable with a soft glass treatment.
- Close button uses border, shadow, and hover lift.
- Restaurant modal still does not render a `Chat WhatsApp` CTA.

## 10. Preset Compatibility

Compatibility was validated through token tests across Restaurant Premium presets:

- `editorial_umber`
- `charcoal_gold`
- `olive_cream`
- `burgundy_linen`
- `espresso_copper`

Each preset now exposes required depth tokens for CTA, secondary CTA, dark surfaces, footer, and modal surfaces.

## 11. Mobile Review

Mobile evidence confirms:

- Buttons remain tappable.
- Button hierarchy remains clear.
- No horizontal overflow was detected in screenshot generation.
- Visit and footer surfaces remain readable without adding excessive vertical space.

## 12. Files Modified

- `frontend/src/features/templates/premiumTheme.ts`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/PremiumFullMenuModal.tsx`
- `frontend/src/features/templates/registry/__tests__/premiumTheme.test.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTemplateSource.test.ts`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/PREMIUM_THEME_TOKEN_SYSTEM.md`

## 13. Testing Results

Passed:

- `npm --prefix frontend run test -- premiumTheme.test.ts premiumTemplateSource.test.ts openingHours.test.ts priceFormat.test.ts`
  - 31 tests passed
- `npm --prefix frontend run lint`
  - Passed
- `npm --prefix frontend run test`
  - 56 tests passed
- `npm --prefix frontend run build`
  - Passed
  - Vite reported only the existing large chunk warning
- `docker compose up -d --build`
  - Passed
- `Invoke-WebRequest http://127.0.0.1/health/ready`
  - HTTP 200
- `npm run smoke-test`
  - 10 tests passed

Backend tests were not run because no backend code was touched.

## 14. Evidence Locations

Evidence folder:

`docs/evidence/restaurant-premium-button-surface-r8/`

Generated screenshots:

- `restaurant-premium-header-cta.png`
- `restaurant-premium-hero-buttons.png`
- `restaurant-premium-visit-reservation-buttons.png`
- `restaurant-premium-footer-surface.png`
- `restaurant-premium-full-menu-modal-tabs.png`
- `restaurant-premium-mobile-buttons.png`

The screenshot generation used route-based Playwright data and did not mutate the database.

## 15. Remaining Risks

- Visual premium feel is partly subjective and still requires product-owner review.
- Depth tokens are intentionally subtle; stronger luxury styling should remain a separate approved stage.
- Existing Vite chunk-size warning remains unchanged and unrelated to this polish.

## 16. Go / No-Go Decision

Decision: GO.

Reason:

- Header CTA, hero CTAs, Visit & Reservation actions, footer, and full menu modal tabs now use subtle premium depth treatment.
- Button hierarchy is clearer without changing Restaurant Premium layout.
- Existing opening-hours formatting, menu currency display, image rendering, modal behavior, and smoke flows still pass.
- No backend, Prisma, database migration, billing, subscription, entitlement, marketplace, hosting, or new template change was introduced.
