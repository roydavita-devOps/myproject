# Phase 9.11B - Free Template Naming Cleanup And Baseline Quality Pass Report

Date: 2026-07-10

## Executive Summary

Stage 9.11B is implemented and locally validated.

The user-facing Free template names have been simplified to business-type names while preserving all internal template keys. Premium names remain unchanged. The template selection modal, template cards, preview routes, publish readiness panel, and premium regression paths were validated locally through automated tests, smoke tests, Docker health checks, and screenshot evidence.

Railway production redeploy remains deferred because the Railway trial is inactive/expired. No backend, Prisma, database, payment, subscription, entitlement, marketplace, hosting renewal, or new template feature was introduced.

## Scope

Implemented:

- Rename user-facing Free template display names.
- Preserve internal template keys and assignment payloads.
- Keep Restaurant Premium as the primary recommended template.
- Keep Cafe Premium available in the View More Templates modal.
- Keep Luxury/unfinished templates hidden from the user-facing catalog.
- Guard Premium Hero Display controls so they do not appear for Free templates.
- Capture evidence for Free template cards, previews, mobile behavior, premium regression, and publish readiness.

Out of scope and unchanged:

- Backend API contract.
- Prisma schema and migrations.
- Database data model.
- Payment, subscription, billing, entitlement, and marketplace logic.
- Hosting renewal.
- New premium or luxury templates.
- Restaurant Premium and Cafe Premium redesign.

## User-Facing Name Mapping

| Internal key | User-facing name |
| --- | --- |
| `restaurant_classic` | Restaurant Free |
| `laundry_clean` | Laundry Free |
| `cafe_modern` | Cafe Free |
| `clinic_professional` | Clinic Free |
| `corporate_executive` | Corporate Free |
| `minimal_business` | Business Free |
| `restaurant_premium` | Restaurant Premium |
| `cafe_premium` | Cafe Premium |

Internal keys remain stable.

## Root Cause Found During Validation

The current selected template summary and preview header already used frontend template metadata, so the new names appeared there correctly.

The View More Templates modal still showed older names such as Restaurant Classic and Cafe Modern because the modal cards were built from the backend template catalog response. That response still carried old display labels. Since this stage does not allow backend/API changes, the fix was applied in the frontend catalog adapter.

The adapter now uses the backend response for stable template keys and recommendation data, then overlays user-facing `displayName` and `description` from frontend template metadata.

## Fix Details

- Updated frontend template metadata display names and simple Free descriptions.
- Updated catalog card construction so user-facing names/descriptions come from frontend metadata.
- Added a fallback path for active frontend metadata templates that are missing from the backend catalog response, so Business Free appears in the modal.
- Added a baseline `minimal_business.jpg` preview asset by reusing the existing corporate preview image as the current general-business placeholder.
- Updated registry and smoke tests to assert Free/Premium naming and key stability.
- Added a Stage 9.11B evidence generator.

## Files Modified

- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/templateCatalog.ts`
- `frontend/src/features/templates/registry/__tests__/templateCatalogReadiness.test.ts`
- `frontend/src/features/templates/registry/__tests__/templateResolver.test.ts`
- `frontend/public/template-previews/minimal_business.jpg`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-free-template-baseline-911b-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`

## Evidence

Evidence folder:

- `docs/evidence/free-template-baseline-9.11b/`

Screenshots:

- `template-modal-free-renamed-section.png`
- `restaurant-free-card.png`
- `laundry-free-card.png`
- `cafe-free-card.png`
- `clinic-free-card.png`
- `corporate-free-card.png`
- `business-free-card.png`
- `free-template-preview-restaurant.png`
- `free-template-preview-laundry.png`
- `free-template-preview-cafe.png`
- `free-template-preview-clinic.png`
- `free-template-preview-corporate.png`
- `free-template-preview-business.png`
- `free-template-mobile-check.png`
- `free-template-no-premium-hero-display.png`
- `restaurant-premium-primary-regression.png`
- `cafe-premium-modal-regression.png`
- `publish-readiness-regression.png`
- `luxury-hidden-regression.png`
- `visual-validation-results.json`

## Validation Results

| Check | Result |
| --- | --- |
| Frontend registry tests | Passed: 12 files, 93 tests |
| Frontend lint | Passed |
| Frontend production build | Passed |
| Docker rebuild | Passed |
| Backend readiness health | Passed: `{"status":"ok","checks":{"database":"ok"}}` |
| Stage 9.11B evidence generation | Passed |
| Smoke tests | Passed: 10/10 |

Build warning:

- Vite still reports the existing non-blocking chunk-size warning because one generated bundle is larger than 500 kB after minification.

## Premium Regression Validation

Validated:

- Restaurant Premium remains the primary recommended template.
- Cafe Premium remains visible and selectable in the modal.
- Free templates do not show Premium Hero Display controls.
- Publish readiness panel still renders.
- Luxury/unfinished templates remain hidden from the user-facing modal.

## Go / No-Go Decision

Go for product owner review.

Stage 9.11B is complete from the local implementation and validation perspective. Production Railway redeploy is intentionally deferred until Railway billing/reactivation is available.

