# PHASE 9.11 - Publish Readiness Gate And Website Launch Flow Report

Date: 2026-07-09

Status: Implemented and locally validated.

## Objective

Implement a launch readiness gate so tenant owners can review required and recommended website readiness before publishing.

This stage does not implement payment, subscription, marketplace, entitlement, hosting renewal, custom domain launch, video/media library, new template keys, backend schema changes, Prisma migrations, or new commercial access control.

## Scope Implemented

- Added a reusable frontend readiness checker in `frontend/src/features/websites/publishReadiness.ts`.
- Added unit tests for required/recommended readiness behavior.
- Added a Website Launch Readiness panel to the website editor.
- Added required checklist, recommended checklist, progress summary, action links, public URL display, and preview/review action.
- Blocked the editor Publish action when required checks are incomplete.
- Added a publish confirmation dialog before calling the existing publish endpoint.
- Reused existing publish/unpublish endpoints and `Website.status`.
- Verified existing public route behavior: public slug route returns only `PUBLISHED` websites.
- Generated screenshot evidence for incomplete, ready, confirmation, success, public, unpublished, Restaurant Premium, and Cafe Premium readiness states.

## Files Modified

- `frontend/src/features/websites/publishReadiness.ts`
- `frontend/src/features/websites/__tests__/publishReadiness.test.ts`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `scripts/generate-publish-readiness-911-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/PUBLISH_READINESS_GATE.md`
- `docs/01-architecture/README.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`
- `docs/06-modern-template/reports/PHASE-9.11-Publish-Readiness-Gate-And-Website-Launch-Flow-Report.md`

## Required Checks

- Business name.
- Business type.
- Template selected.
- Valid public slug.
- At least one contact method.
- Address.
- Valid opening hours.
- Public template renderer resolution.
- Restaurant/cafe/food menu item exists.
- Restaurant/cafe/food menu item names exist.
- Restaurant/cafe/food menu prices format safely and do not render as undefined, null, empty, or NaN.

## Recommended Checks

- Hero image or slideshow.
- Logo.
- Description.
- Gallery has at least 3 images.
- Google Maps URL.
- Social links.
- Restaurant/cafe menu has at least 3 items.
- Featured menu item.
- Menu item images.
- Menu item descriptions.

## Launch Flow

1. Owner opens Website Editor.
2. Readiness checker evaluates the current website payload.
3. Required items block Publish when incomplete.
4. Recommended items remain visible but non-blocking.
5. Owner can review the website before publish.
6. Ready websites open a confirmation dialog before publish.
7. Confirm publish calls the existing publish endpoint.
8. Published state shows public URL and existing share/open actions.
9. Unpublish continues using the existing unpublish endpoint.

## Screenshot Evidence

Evidence folder:

- `docs/evidence/publish-readiness-9.11/`

Screenshots:

- `publish-readiness-incomplete.png`
- `publish-readiness-required-items.png`
- `publish-readiness-recommended-items.png`
- `publish-readiness-action-links.png`
- `publish-readiness-ready-to-publish.png`
- `publish-confirmation-dialog.png`
- `publish-success-state.png`
- `public-url-after-publish.png`
- `preview-before-publish.png`
- `unpublished-public-state.png`
- `restaurant-premium-ready-check.png`
- `cafe-premium-ready-check.png`

Result manifest:

- `docs/evidence/publish-readiness-9.11/visual-validation-results.json`

## Validation Results

| Check | Result |
| --- | --- |
| Frontend readiness tests | PASS: 12 files, 91 tests |
| Frontend lint | PASS |
| Frontend production build | PASS |
| Docker rebuild | PASS |
| Backend health | PASS: `/health` returned database/storage OK |
| Evidence generation | PASS |
| Smoke tests | PASS: 10/10 |

Build note:

- Vite still reports the existing non-blocking chunk-size warning for the main JS bundle.

## Regression Validation

- Existing publish/unpublish API contract remains unchanged.
- Existing public route still requires `PUBLISHED` status.
- Existing template selection, preview, Restaurant Premium, Cafe Premium, Classic Cafe guard, and cross-template smoke tests passed.
- Existing upload, menu, gallery, slug, Hero Display, template renderer, and public template routes were not redesigned.

## Deferred Items

- Server-side publish readiness enforcement remains a future hardening option. Stage 9.11 gates publishing from the owner editor UI and reuses existing backend status enforcement for public routes.
- Payment, subscription, entitlement, marketplace, hosting renewal, custom domains, and template access enforcement remain future stages.

## Rollback Strategy

1. Revert `WebsiteEditorPage.tsx` publish readiness panel and confirmation dialog changes.
2. Remove `publishReadiness.ts` and its unit test.
3. Remove the Stage 9.11 evidence script and documentation updates.
4. Keep existing backend publish/unpublish endpoints unchanged.

## Go / No-Go

Go for Stage 9.11 approval from local validation.

Production redeploy remains dependent on the normal GitHub to Vercel/Railway pipeline and Railway availability.
