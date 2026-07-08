# PHASE 9.10 - Premium Template Catalog & Template Selection Readiness Report

Last updated: 2026-07-08

## 1. Executive Summary

Stage 9.10 improves the template catalog and selection experience so locked premium templates are clearly visible while preserving the core product decision:

```text
Business Type = recommendation signal
Template = user choice
```

Restaurant Premium and Cafe Premium now appear as approved Premium templates. Classic templates are separated from Premium templates. Users can preview templates without saving, confirm before changing templates, and still choose templates outside their recommended business category.

No payment, checkout, subscription, billing, marketplace, entitlement enforcement, hosting renewal, publish gate, backend API change, Prisma migration, database change, upload pipeline change, video hero, advanced media library, or new template implementation was introduced.

## 2. Scope

Included:

- Frontend template catalog metadata readiness.
- Recommended, Premium, Classic, and All template sections.
- Approved Premium badges for Restaurant Premium and Cafe Premium.
- Preview highlights and capability metadata.
- Non-persistent template preview route using `?templateKey=`.
- Lightweight confirmation before applying a template.
- Local evidence and smoke validation.

Excluded:

- Payment, subscription, billing, checkout, purchase, coupon, invoice, entitlement enforcement, and hosting renewal.
- Marketplace implementation.
- Public template redesign.
- Backend API changes.
- Prisma migration or database schema changes.
- Upload pipeline changes.
- New backend features or new templates.

## 3. Current Template Selection Audit

Findings:

1. Templates are registered in the frontend registry at `frontend/src/features/templates/registry/templateMetadata.ts`.
2. Selection UI lives in `frontend/src/features/templates/TemplateSelectionPage.tsx`.
3. Selected template is persisted by `websitesApi.assignTemplate()`.
4. Backend assignment stores the selected template through `website.templateId` and template schema metadata.
5. Public rendering resolves by `template_key -> templateRegistry -> renderer`.
6. Users already can change template after registration through `/app/websites/:id/templates`.
7. Business type is used as a recommendation and default metadata signal, not as a hard renderer lock.
8. Existing preview route existed for current website preview; Stage 9.10 adds safe non-persistent template preview override.

Backend/database changes were not required.

## 4. Template Metadata Changes

Frontend metadata now includes catalog-readiness fields:

- `catalogStatus`
- `previewHighlights`
- `capabilities`
- `supportsHeroSlideshow`

Locked approved premium templates:

- `restaurant_premium`
- `cafe_premium`

Premium capability examples:

- `heroSlideshow`
- `premiumMenuModal`
- `galleryBatchUpload`
- `menuItemDetail`
- `formattedOpeningHours`

Classic templates do not automatically receive premium-only capabilities.

## 5. Classic vs Premium Catalog UX

Catalog sections:

- Recommended for your business.
- Premium Templates.
- Classic Templates.
- All Templates.

Premium cards show:

- Premium badge.
- Approved Premium badge.
- Preview highlights.
- Soft future payment note.

Classic cards show:

- Classic badge.
- Category and highlights.
- Standard preview and selection controls.

The catalog does not show `Pay now`, `Checkout`, `Subscribe`, or purchase actions.

## 6. Recommendation Logic

Recommendation logic uses business type only for sorting and badges.

Rules validated:

- Recommended templates appear first.
- Users can still browse all templates.
- Users can select non-recommended templates.
- Business type does not hard-lock template selection.

## 7. Template Selection Behavior

Selection behavior:

- Current selected template is shown.
- Users can preview another template.
- Users can choose another template.
- A confirmation dialog explains that layout may change while business data, menu, gallery, and contact information remain.
- Selection persists through the existing assign-template API.
- Public site renders the selected template key.

## 8. Premium Template Behavior Before Payment

Current MVP behavior:

- Premium templates are visible and selectable during development/pilot.
- Premium badges are shown.
- No payment enforcement is implemented.
- Entitlement/payment gate is documented for a future approved stage.
- No fake upgrade, purchase, checkout, or payment button was added.

## 9. Capability-Based UI

Premium-only behavior uses metadata/capability flags.

Examples:

- `supportsHeroSlideshow`
- `capabilities.heroSlideshow`
- `capabilities.premiumMenuModal`
- `capabilities.menuItemDetail`

Classic templates remain guarded from premium-only controls.

## 10. Preview / Rendering Validation

Preview behavior:

- `/app/websites/:id/preview?templateKey=...` previews another active template without persisting it.
- The preview header explains that the preview does not change the selected template.
- Applying still requires the confirmation flow.

Rendering validation:

- Cafe Premium persisted and rendered publicly after selection.
- Restaurant Premium persisted and rendered publicly after selection.

## 11. Restaurant Premium Validation

Restaurant Premium appears in the Premium Templates section as:

- Premium.
- Approved Premium.
- Recommended for restaurant/warteg/cafe business types.
- Selectable before payment enforcement.

Public rendering after selection:

- `main[data-template-key="restaurant_premium"]`.

## 12. Cafe Premium Validation

Cafe Premium appears in the Premium Templates section as:

- Premium.
- Approved Premium.
- Recommended for cafe business type.
- Selectable before payment enforcement.

Public rendering after selection:

- `main[data-template-key="cafe_premium"]`.

## 13. Classic Template Guard

Classic templates are separated from Premium templates.

Classic Cafe guard validation:

- `cafe_modern` does not render premium Hero Display controls.
- Premium-only controls remain capability-gated.

## 14. Local-Only / Railway Status

Railway trial is currently inactive/expired.

Stage 9.10 was validated locally only:

- Local Docker.
- Local health check.
- Local Playwright evidence.
- Local smoke tests.

Railway deployment was not attempted.

## 15. Files Modified

- `frontend/src/features/templates/TemplateSelectionPage.tsx`
- `frontend/src/features/templates/templateCatalog.ts`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `frontend/src/features/templates/registry/__tests__/templateCatalogReadiness.test.ts`
- `frontend/src/features/websites/WebsitePreviewPage.tsx`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-template-catalog-readiness-910-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`
- `docs/06-modern-template/reports/PHASE-9.10-Premium-Template-Catalog-And-Selection-Readiness-Report.md`
- `docs/evidence/template-catalog-readiness-9.10/`

Backend code was not modified.

## 16. Testing Results

Commands run:

```powershell
node --check scripts\generate-template-catalog-readiness-910-evidence.mjs
npm --prefix frontend run test
npm --prefix frontend run lint
npm --prefix frontend run build
docker compose up -d --build
Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing
node scripts\generate-template-catalog-readiness-910-evidence.mjs
npm run smoke-test
```

Results:

- Evidence script syntax check: passed.
- Frontend tests: 11 files passed, 87 tests passed.
- Frontend lint: passed.
- Frontend production build: passed.
- Docker rebuild: passed.
- Health check: `200`.
- Evidence generation: passed.
- Smoke tests: 10 passed.

Known build note:

- Vite still reports the existing warning that the main production JS chunk is larger than 500 kB. This is a warning, not a build failure.

## 17. Evidence Locations

- `docs/evidence/template-catalog-readiness-9.10/template-catalog-premium-section.png`
- `docs/evidence/template-catalog-readiness-9.10/template-catalog-classic-section.png`
- `docs/evidence/template-catalog-readiness-9.10/template-catalog-recommended-cafe.png`
- `docs/evidence/template-catalog-readiness-9.10/template-catalog-recommended-restaurant.png`
- `docs/evidence/template-catalog-readiness-9.10/template-card-restaurant-premium.png`
- `docs/evidence/template-catalog-readiness-9.10/template-card-cafe-premium.png`
- `docs/evidence/template-catalog-readiness-9.10/template-selection-current-template.png`
- `docs/evidence/template-catalog-readiness-9.10/template-selection-change-confirmation.png`
- `docs/evidence/template-catalog-readiness-9.10/template-selection-cafe-premium-selected.png`
- `docs/evidence/template-catalog-readiness-9.10/restaurant-premium-render-after-selection.png`
- `docs/evidence/template-catalog-readiness-9.10/cafe-premium-render-after-selection.png`
- `docs/evidence/template-catalog-readiness-9.10/classic-template-no-premium-hero-display.png`
- `docs/evidence/template-catalog-readiness-9.10/visual-validation-results.json`

## 18. Remaining Risks

- Railway production validation remains deferred until Railway is reactivated.
- Payment/subscription/template entitlement is not implemented yet.
- Publish readiness gate is not implemented yet.
- Preview image assets may need higher-fidelity production artwork later.
- Existing Vite chunk-size warning remains a future performance optimization.

## 19. Go / No-Go Decision

Recommendation: Go for Stage 9.10 approval.

Reason:

- Restaurant Premium and Cafe Premium appear as locked/approved Premium templates.
- Classic templates are separated from Premium templates.
- Business type recommends templates but does not force choice.
- Users can preview, confirm, select, persist, and publicly render selected templates.
- Premium templates are visible before payment enforcement without fake payment UI.
- Premium-only capabilities remain metadata/capability-gated.
- Local tests, build, Docker health, smoke tests, and evidence generation passed.
