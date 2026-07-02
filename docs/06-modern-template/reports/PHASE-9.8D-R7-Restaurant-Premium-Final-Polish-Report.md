# PHASE 9.8D-R7 - Restaurant Premium Final Polish Report

Date: 2026-07-02

## 1. Executive Summary

Stage 9.8D-R7 fixes the final Restaurant Premium polish blockers found after the R6 color system remediation. The implementation focuses on public opening-hours formatting, readable gallery placeholders, natural Signature Dishes copy, and stable section anchors for Restaurant Premium navigation.

Status: GO for approval.

## 2. Scope

Implemented only presentation and validation polish for Restaurant Premium.

Out of scope and unchanged:

- Backend code
- Prisma schema
- Database migrations
- Payment, subscription, entitlement, marketplace, or hosting logic
- Cafe Premium redesign
- New templates
- Image pipeline or storage adapter changes

## 3. Opening Hours Formatting Fix

Root issue:

The shared formatter could fall back to serializing arbitrary object entries. Structured opening-hours data could therefore appear publicly as internal fields such as `mode`, `days`, `openTime`, and `closeTime`.

Fix:

- `formatOpeningHours` now supports legacy strings, `display` values, daily objects, weekday/weekend objects, specific/custom day objects, and closed objects.
- Time values display with dots, for example `11:00` becomes `11.00`.
- Consecutive specific days collapse into ranges, for example `Tue - Sat`.
- Invalid/missing structured data uses fallback text and never serializes raw keys.
- Restaurant Premium continues to use this centralized formatter in the hero visit card, Visit & Reservation section, and footer.

## 4. Gallery Placeholder Readability Fix

Root issue:

The fallback Gallery placeholder cards looked intentional, but supporting text used a low-specificity white opacity class that could become weak against premium surfaces.

Fix:

- Placeholder title now explicitly uses `--premium-text-on-dark`.
- Placeholder description now uses `--premium-modal-muted-text`.
- Placeholder visual state remains dark, premium, and intentional without appearing broken.

## 5. Signature Dishes Copy Update

Updated:

- `Dishes Worth Reserving For`

To:

- `Dishes Worth the Visit`

Helper copy changed from internal/product-like wording to:

- `A focused look at the dishes guests come back for.`

## 6. Navigation Anchor Fix

Restaurant Premium navigation now uses stable anchors:

- Menu -> `#signature-dishes`
- Story -> `#restaurant-story`
- Gallery -> `#ambience-gallery`
- Visit -> `#visit-reservation`

CTA behavior:

- Hero `Explore Signature Dishes` points to `#signature-dishes`.
- Hero `Get Directions` opens the maps URL when present.
- If maps URL is missing, Hero `Get Directions` falls back to `#visit-reservation`.
- Header reservation CTA remains the existing reservation/contact action.
- Signature `Explore Full Menu` still opens the full menu modal.

## 7. Files Modified

- `frontend/src/features/templates/openingHours.ts`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/templateActions.ts`
- `frontend/src/features/templates/registry/__tests__/openingHours.test.ts`
- `frontend/src/features/templates/registry/__tests__/priceFormat.test.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTemplateSource.test.ts`
- `smoke/saas.smoke.spec.ts`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/OPENING_HOURS_DISPLAY_FORMATTER.md`

## 8. Testing Results

Passed:

- `npm --prefix frontend run test -- openingHours.test.ts priceFormat.test.ts premiumTemplateSource.test.ts`
  - 18 tests passed
- `npm --prefix frontend run lint`
  - Passed
- `npm --prefix frontend run test`
  - 55 tests passed
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

## 9. Evidence Locations

Evidence folder:

`docs/evidence/restaurant-premium-final-polish-r7/`

Generated screenshots:

- `restaurant-premium-opening-hours-formatted.png`
- `restaurant-premium-gallery-placeholder-readable.png`
- `restaurant-premium-signature-heading.png`
- `restaurant-premium-visit-anchor.png`
- `restaurant-premium-mobile.png`

The screenshot generation used route-based Playwright data and did not mutate the database.

## 10. Remaining Risks

- Existing legacy records with non-standard opening-hours shapes will display safe fallback text instead of raw object serialization.
- Mobile header navigation remains hidden by the existing responsive design; mobile users still reach Visit & Reservation through page flow and CTA fallback.
- Final copy/visual approval remains a product-owner decision.

## 11. Go / No-Go Decision

Decision: GO.

Reason:

- Public opening hours no longer expose raw structured keys.
- Restaurant Premium opening hours render as clean customer-facing text.
- Gallery placeholders are readable.
- Signature Dishes heading is natural.
- Header Visit, Menu, Story, and Gallery anchors are stable on desktop/tablet navigation.
- Hero Signature Dishes and Get Directions fallback behavior is validated.
- Full Menu Modal, menu currency display, and existing image rendering remain covered by tests/smoke.
- No backend, Prisma, database migration, billing, subscription, entitlement, marketplace, hosting, or new template change was introduced.
