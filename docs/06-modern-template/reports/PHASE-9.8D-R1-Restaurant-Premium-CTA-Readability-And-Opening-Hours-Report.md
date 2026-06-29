# PHASE 9.8D-R1 - Restaurant Premium CTA, Readability & Opening Hours Report

Date: 2026-06-29

## 1. Executive Summary

Stage 9.8D-R1 resolves the remaining Restaurant Premium visual review findings:

- Hero no longer repeats the global `Reserve a Table` CTA.
- Header keeps one clear `Reserve a Table` CTA.
- Visit & Reservation now uses a readable dark final-action card.
- Opening Hours is editable from the dashboard and rendered from existing website data.

No new template, marketplace, billing, subscription, entitlement, backend schema change, Prisma migration, or database migration was introduced.

## 2. Scope

Included:

- Existing `restaurant_premium` renderer.
- Website editor Opening Hours field.
- Existing `Website.openingHours` JSON persistence.
- Smoke test and source test updates.
- R1 screenshot evidence generation.

Excluded:

- Cafe Premium redesign.
- Other template redesigns.
- New templates.
- Template Marketplace or Catalog.
- Billing, subscription, entitlement, or plan restrictions.
- Prisma migration.

## 3. Hero CTA Changes

Before R1, the hero rendered:

- `Reserve a Table`
- `Explore Signature Dishes`
- `Get Directions`

After R1, the CTA strategy is:

- Header: `Reserve a Table`
- Hero: `Explore Signature Dishes`
- Hero optional: `Get Directions`
- Signature Dishes: `Explore Full Menu`
- Visit & Reservation: `Reserve via WhatsApp`, `Call Restaurant`, `Get Directions`
- Footer: no generic WhatsApp CTA

The hero reservation action was removed from `resolvePremiumRestaurantActions()`.

## 4. Visit & Reservation Readability Fix

The unreadable Visit & Reservation reservation card was caused by relying on the shared `TemplateCard` base background while forcing white text. The shared card surface could remain light, producing white text on a light card.

Fix:

- Replaced only the reservation card with a custom dark `article`.
- Used `bg-[var(--premium-surface-dark)]`.
- Kept title and supporting copy explicit white/readable.
- Kept CTA buttons visible on the dark surface.

Validated readable text:

- `Reserve your table tonight`
- `Reserve a table or ask what is available today.`
- `Reserve via WhatsApp`
- `Call Restaurant`
- `Get Directions`

## 5. Opening Hours Editability Investigation

Existing support found:

- Prisma: `Website.openingHours Json?`.
- Backend DTO: `UpdateWebsiteDto.openingHours`.
- Backend service: `WebsitesService.update()` persists `openingHours`.
- API response type: `Website.openingHours`.
- Public templates already render `website.openingHours`.

Missing piece:

- Dashboard editor did not expose an Opening Hours field.

Decision:

- No database migration is required.
- No backend schema change is required.
- Store dashboard-edited simple hours as `{ display: string }` in existing `Website.openingHours`.

## 6. Opening Hours Implementation

Dashboard:

- Added `Opening Hours` field in `WebsiteEditorPage`.
- Placeholder: `Daily, 11.00 - 22.00`.
- Saves through existing `websitesApi.update()`.
- API type now includes `openingHours`.

Renderer:

- Restaurant Premium `formatOpeningHours()` now supports `openingHours.display`.
- Existing day-key object rendering remains supported.
- Hero visit card label changed from `Opening cue` to `Opening Hours`.

## 7. Files Modified

- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `frontend/src/features/websites/websites.api.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTemplateSource.test.ts`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-restaurant-premium-r1-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`

## 8. Testing Results

Passed:

- `npm --prefix frontend run lint`
- `npm --prefix frontend run test` - 3 files, 39 tests
- `npm --prefix frontend run build`
- `docker compose up -d --build`
- Local `/health` - HTTP 200
- Local `/health/ready` - HTTP 200
- `node scripts/generate-restaurant-premium-r1-evidence.mjs`
- `npm run smoke-test` - 10 tests passed

Backend lint/build/tests were not required because no backend code was modified.

## 9. Evidence Locations

- `docs/evidence/restaurant-premium-editorial-redesign-r1/restaurant-premium-hero-desktop.png`
- `docs/evidence/restaurant-premium-editorial-redesign-r1/restaurant-premium-visit-reservation-desktop.png`
- `docs/evidence/restaurant-premium-editorial-redesign-r1/restaurant-premium-mobile.png`
- `docs/evidence/restaurant-premium-editorial-redesign-r1/restaurant-premium-opening-hours-editor.png`
- `docs/evidence/restaurant-premium-editorial-redesign-r1/visual-validation-results.json`

Evidence validates:

- Header `Reserve a Table` remains visible.
- Hero does not render `Reserve a Table`.
- Hero keeps `Explore Signature Dishes`.
- Visit & Reservation card is readable.
- Opening Hours editor field is visible and saved.
- No horizontal overflow on mobile.
- No generic repeated `Chat WhatsApp` CTA appears in Restaurant Premium.

## 10. Risks

- Opening Hours is stored as a simple display string for now. This is suitable for the current UI, but future structured per-day editing may need a richer editor.
- Existing templates that render day-key opening hour objects remain supported.
- Some public pages may show opening hours in multiple places by design: hero visit card, Visit & Reservation, and footer. R1 avoids repeating reservation CTA, not all opening-hour mentions.

## 11. Go / No-Go Decision

Decision: GO for approval.

Success criteria met:

- Hero no longer shows `Reserve a Table` next to `Explore Signature Dishes`.
- Header still shows one clear `Reserve a Table` CTA.
- Visit & Reservation text is readable.
- Opening Hours can be edited by the user.
- Opening Hours renders in Restaurant Premium.
- No Prisma migration was added.
- Existing full menu modal still works.
- Existing template selection still works.
- Evidence captured.
